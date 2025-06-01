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
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
  } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const [brandPreview, setBrandPreview] = useState(null);

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
        setBrandPreview(result.data);
        // Auto-fill description if available
        if (result.data.ai_overview?.brand_overview) {
          setFormData((prev) => ({
            ...prev,
            description: result.data.ai_overview.brand_overview,
          }));
        }
      }
    } catch (error) {
      console.error("Website analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
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
      };

      const response = await apiClient.brands.create(brandData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        // Update user context with brand info
        updateUser({
          brand_id: result.data.brand.id,
          brand_name: result.data.brand.brand_name,
        });

        // Redirect to dashboard
        router.push("/dashboard");
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
      title: "Company Details",
      description: "Industry and company info",
    },
    {
      number: 3,
      title: "Preferences",
      description: "Budget and audience targeting",
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Let's get you started with InfluencerFlow AI
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
                  Tell us about your brand and website
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
                  helperText="We'll analyze your website to better understand your brand"
                  containerClassName="flex-1"
                />

                <div className="pt-8">
                  <Button
                    variant="outline"
                    onClick={analyzeWebsite}
                    loading={isAnalyzing}
                    disabled={!formData.website_url.trim()}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
              </div>

              {brandPreview && (
                <div className="p-4 bg-primary-50 rounded-lg animate-fade-in">
                  <h4 className="font-medium text-primary-900 mb-2">
                    Website Analysis Complete
                  </h4>
                  <p className="text-sm text-primary-700">
                    We've analyzed your website and will use this information to
                    enhance your brand profile.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Company Details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Company Details
                </h2>
                <p className="text-gray-600">
                  Help us understand your business better
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

          {/* Step 3: Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <DollarSign className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Campaign Preferences
                </h2>
                <p className="text-gray-600">
                  Set your budget and targeting preferences (optional)
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
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Target Audience (Optional)
                </h4>

                <Input
                  label="Age Range"
                  placeholder="e.g., 18-35"
                  value={formData.target_audience.age_range}
                  onChange={(e) =>
                    handleInputChange(
                      "target_audience.age_range",
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
                  label="Demographics"
                  placeholder="e.g., urban professionals, college students"
                  value={formData.target_audience.demographics}
                  onChange={(e) =>
                    handleInputChange(
                      "target_audience.demographics",
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
              {currentStep === 3 ? "Complete Setup" : "Next Step"}
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Don't worry, you can always update these details later in your
            dashboard settings.
          </p>
        </div>
      </div>
    </div>
  );
}
