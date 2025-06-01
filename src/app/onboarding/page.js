"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import {
  Sparkles,
  Building2,
  Globe,
  Users,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Target,
  TrendingUp,
  Lightbulb,
  Eye,
  Edit,
  Brain,
  Zap,
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function EnhancedOnboardingPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
    setBrandStatus,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const [formData, setFormData] = useState({
    brand_name: "",
    website_url: "",
    industry: "",
    company_size: "small",
    description: "",
    monthly_budget: "",
    currency: "USD",
    target_audience: {
      age_range: "",
      interests: "",
      demographics: "",
    },
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Check if user already has a brand
  useEffect(() => {
    if (user?.brand_id) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const industries = [
    "Technology",
    "Fashion & Beauty",
    "Food & Beverage",
    "Health & Fitness",
    "Travel & Tourism",
    "Gaming",
    "Education",
    "Finance",
    "Automotive",
    "Real Estate",
    "Entertainment",
    "Sports",
    "Other",
  ];

  const companySizes = [
    { value: "startup", label: "Startup (1-10 employees)" },
    { value: "small", label: "Small Business (11-50 employees)" },
    { value: "medium", label: "Medium Business (51-200 employees)" },
    { value: "large", label: "Large Business (201-1000 employees)" },
    { value: "enterprise", label: "Enterprise (1000+ employees)" },
  ];

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
    setError("");
  };

  const analyzeWebsite = async () => {
    if (!formData.website_url.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await apiClient.brands.analyzeWebsite(
        formData.website_url,
        formData.brand_name
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setAiAnalysis(result.data.ai_overview);
        setShowAIAnalysis(true);

        // Auto-fill form data from AI analysis
        if (result.data.ai_overview?.industry) {
          setFormData((prev) => ({
            ...prev,
            industry: result.data.ai_overview.industry,
            description: result.data.ai_overview.overview || prev.description,
          }));
        }

        // Auto-fill target audience if available
        if (result.data.ai_overview?.target_audience) {
          const targetAudience = result.data.ai_overview.target_audience;
          setFormData((prev) => ({
            ...prev,
            target_audience: {
              demographics: targetAudience.demographics || "",
              interests: targetAudience.interests?.join(", ") || "",
              age_range: targetAudience.behavior || "",
            },
          }));
        }
      }
    } catch (error) {
      console.error("Website analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.brand_name.trim()) {
          setError("Brand name is required");
          return false;
        }
        break;
      case 2:
        if (!formData.industry) {
          setError("Please select an industry");
          return false;
        }
        break;
      case 3:
        // Optional step - no validation required
        break;
      default:
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleCreateBrand();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateBrand = async () => {
    setIsLoading(true);
    setError("");

    try {
      const brandData = {
        ...formData,
        target_audience:
          Object.keys(formData.target_audience).length > 0
            ? formData.target_audience
            : undefined,
        monthly_budget: formData.monthly_budget
          ? Number(formData.monthly_budget)
          : undefined,
        ai_analysis: aiAnalysis, // Include AI analysis in brand creation
      };

      const response = await apiClient.brands.create(brandData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        // Update user context with brand info
        updateUser({
          brand_id: result.data.brand.id,
          brand_name: result.data.brand.brand_name,
        });

        // Update brand status
        setBrandStatus(true);

        // Redirect directly to product creation
        router.push("/products/create?onboarding=true");
      } else {
        setError(result.error || "Failed to create brand profile");
      }
    } catch (error) {
      console.error("Brand creation error:", error);
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Brand Basics",
      description: "Tell us about your brand",
    },
    {
      number: 2,
      title: "AI Analysis",
      description: "Review AI insights",
    },
    {
      number: 3,
      title: "Preferences",
      description: "Budget and targeting",
    },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Set up your brand profile
          </h1>
          <p className="text-xl text-gray-600">
            Let AI help you create the perfect brand profile for your influencer
            campaigns
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${
                      currentStep >= step.number
                        ? "bg-primary-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`
                    w-16 h-1 mx-4 rounded transition-all duration-300
                    ${
                      currentStep > step.number
                        ? "bg-primary-600"
                        : "bg-gray-200"
                    }
                  `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Brand Basics */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Brand Basics
                </h2>
                <p className="text-gray-600">
                  Tell us about your brand and we'll analyze it with AI
                </p>
              </div>

              <Input
                label="Brand Name"
                placeholder="Enter your brand name"
                value={formData.brand_name}
                onChange={(e) =>
                  handleInputChange("brand_name", e.target.value)
                }
                required
                icon={Building2}
              />

              <div className="flex gap-4">
                <Input
                  label="Website URL"
                  placeholder="https://yourbrand.com"
                  value={formData.website_url}
                  onChange={(e) =>
                    handleInputChange("website_url", e.target.value)
                  }
                  icon={Globe}
                  helperText="We'll analyze your website to understand your brand better"
                  containerClassName="flex-1"
                />

                <div className="pt-8">
                  <Button
                    variant="gradient"
                    onClick={analyzeWebsite}
                    loading={isAnalyzing}
                    disabled={
                      !formData.website_url.trim() ||
                      !formData.brand_name.trim()
                    }
                    icon={Brain}
                  >
                    {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                  </Button>
                </div>
              </div>

              {/* AI Analysis Results */}
              {showAIAnalysis && aiAnalysis && (
                <div className="mt-8 p-6 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 animate-fade-in">
                  <div className="flex items-center mb-4">
                    <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      AI Analysis Complete
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Overview */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Brand Overview
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiAnalysis.overview}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Industry & Position
                        </h4>
                        <p className="text-sm text-gray-700">
                          <strong>Industry:</strong> {aiAnalysis.industry}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {aiAnalysis.market_position}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Brand Personality
                        </h4>
                        <div className="text-sm text-gray-700">
                          <p>
                            <strong>Tone:</strong>{" "}
                            {aiAnalysis.brand_personality?.tone}
                          </p>
                          <p>
                            <strong>Style:</strong>{" "}
                            {aiAnalysis.brand_personality?.style}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {aiAnalysis.brand_personality?.values?.map(
                              (value, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                                >
                                  {value}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Services & Audience */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Products & Services
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.products_services?.map(
                            (service, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {service}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          Target Audience
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          {aiAnalysis.target_audience?.demographics}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.target_audience?.interests?.map(
                            (interest, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {interest}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Creator Collaboration Fit
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          <strong>Ideal Creators:</strong>{" "}
                          {aiAnalysis.collaboration_fit?.ideal_creators}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.collaboration_fit?.content_types?.map(
                            (type, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {type}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/70 rounded-lg">
                    <p className="text-sm text-gray-600 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Great! We've pre-filled your brand information based on
                      this analysis. You can review and modify it in the next
                      steps.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Company Details with AI Pre-filled Data */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <Brain className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Review AI Analysis
                </h2>
                <p className="text-gray-600">
                  Review and edit the information we've gathered about your
                  brand
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) =>
                    handleInputChange("industry", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your industry</option>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                {aiAnalysis && (
                  <p className="text-xs text-primary-600 mt-1">
                    AI suggested: {aiAnalysis.industry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={formData.company_size}
                  onChange={(e) =>
                    handleInputChange("company_size", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {companySizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Description
                  {aiAnalysis && (
                    <span className="text-xs text-primary-600 ml-2">
                      (AI Enhanced)
                    </span>
                  )}
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your brand, mission, and what makes you unique..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Step 3: Preferences with AI-suggested audience */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <DollarSign className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Campaign Preferences
                </h2>
                <p className="text-gray-600">
                  Set your budget and targeting preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Monthly Budget (Optional)"
                  type="number"
                  placeholder="5000"
                  value={formData.monthly_budget}
                  onChange={(e) =>
                    handleInputChange("monthly_budget", e.target.value)
                  }
                  icon={DollarSign}
                  helperText="Your estimated monthly influencer marketing budget"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Target Audience
                  {aiAnalysis && (
                    <span className="text-xs text-primary-600 ml-2">
                      (AI Enhanced)
                    </span>
                  )}
                </h4>

                <Input
                  label="Demographics"
                  placeholder="e.g., young professionals, college students"
                  value={formData.target_audience.demographics}
                  onChange={(e) =>
                    handleInputChange(
                      "target_audience.demographics",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Interests"
                  placeholder="e.g., technology, fitness, travel"
                  value={formData.target_audience.interests}
                  onChange={(e) =>
                    handleInputChange(
                      "target_audience.interests",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Behavior & Preferences"
                  placeholder="e.g., early adopters, value-conscious, premium buyers"
                  value={formData.target_audience.age_range}
                  onChange={(e) =>
                    handleInputChange(
                      "target_audience.age_range",
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Previous
            </Button>

            <Button
              variant="primary"
              onClick={nextStep}
              loading={isLoading}
              icon={currentStep === 3 ? CheckCircle : ArrowRight}
              iconPosition="right"
            >
              {currentStep === 3 ? "Complete & Add Products" : "Next Step"}
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            After completing your brand profile, you'll be guided to add your
            first product and create campaigns with AI-powered creator
            recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}
