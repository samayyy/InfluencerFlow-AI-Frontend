// src/app/campaigns/create/page.js - Updated version with enhanced features
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import {
  Megaphone,
  Target,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Upload,
  FileText,
  MessageSquare,
  Globe,
  Package,
  Zap,
  Eye,
  MapPin,
  X,
  Lightbulb,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

export default function EnhancedCampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [activeTab, setActiveTab] = useState("form"); // form, document, query
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_type: "sponsored_post",
    description: "",
    objectives: "",
    // Integrated product fields
    product_name: "",
    product_url: "",
    product_price: "",
    // Campaign fields
    budget: "",
    currency: "USD",
    start_date: "",
    end_date: "",
    location: "",
    content_guidelines: "",
    hashtags: "",
    mention_requirements: "",
    approval_required: true,
    target_audience: {
      demographics: "",
      interests: "",
      age_groups: "",
      follower_range: "",
    },
    requirements: {
      deliverables: [],
      platforms: [],
      content_type: [],
    },
  });

  // Document upload state
  const [documentFile, setDocumentFile] = useState(null);
  const [documentPreview, setDocumentPreview] = useState("");

  // Query state
  const [queryText, setQueryText] = useState("");
  const [queryPreview, setQueryPreview] = useState(null);

  // AI Analysis state
  const [productAnalysis, setProductAnalysis] = useState(null);

  const campaignTypes = [
    { value: "sponsored_post", label: "Sponsored Post" },
    { value: "brand_ambassador", label: "Brand Ambassador" },
    { value: "product_review", label: "Product Review" },
    { value: "event_coverage", label: "Event Coverage" },
    { value: "content_collaboration", label: "Content Collaboration" },
  ];

  const currencies = ["USD", "EUR", "GBP", "INR"];

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

  // Analyze product URL
  const analyzeProductUrl = async () => {
    if (!formData.product_url) return;

    setIsAnalyzing(true);
    try {
      const response = await apiClient.campaigns.analyzeProductUrl({
        product_url: formData.product_url,
        product_name: formData.product_name,
      });

      const result = apiUtils.handleResponse(response);
      if (result.success) {
        setProductAnalysis(result.data.product_analysis);
        
        // Auto-fill form with AI insights
        const analysis = result.data.product_analysis;
        const suggestions = result.data.suggestions;

        setFormData(prev => ({
          ...prev,
          product_name: analysis.product_name || prev.product_name,
          campaign_name: suggestions.campaign_name || prev.campaign_name,
          description: analysis.campaign_angles?.[0] || prev.description,
          target_audience: {
            ...prev.target_audience,
            demographics: analysis.target_audience?.demographics || prev.target_audience.demographics,
            interests: analysis.target_audience?.interests?.join(", ") || prev.target_audience.interests,
            age_groups: analysis.target_audience?.age_groups?.join(", ") || prev.target_audience.age_groups,
          },
        }));

        setSuccessMessage("Product analyzed successfully! Form auto-filled with AI insights.");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Failed to analyze product URL");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!formData.campaign_name.trim()) {
      setError("Campaign name is required");
      return;
    }

    setIsLoading(true);
    try {
      const campaignData = {
        ...formData,
        hashtags: formData.hashtags
          ? formData.hashtags.split(",").map((h) => h.trim().replace(/^#/, ""))
          : [],
      };

      const response = await apiClient.campaigns.createForm(campaignData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created successfully!");
        setTimeout(() => {
          router.push(`/campaigns/${result.data.campaign.id}/recommendations`);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    const allowedTypes = ['text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a TXT file. PDF support coming soon.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    setDocumentFile(file);
    
    // Show preview for text files
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocumentPreview(e.target.result.substring(0, 500));
    };
    reader.readAsText(file);
  };

  // Submit document for analysis
  const handleDocumentSubmit = async () => {
    if (!documentFile) {
      setError("Please select a document first");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', documentFile);

      const response = await apiClient.campaigns.createFromDocument(formData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created from document successfully!");
        setTimeout(() => {
          router.push(`/campaigns/${result.data.campaign.id}/recommendations`);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  // Preview query extraction
  const previewQueryExtraction = async () => {
    if (!queryText.trim() || queryText.length < 50) {
      setError("Please provide a more detailed query (at least 50 characters)");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.campaigns.previewQuery({ query: queryText });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setQueryPreview(result.data.preview);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit query for campaign creation
  const handleQuerySubmit = async () => {
    if (!queryText.trim()) {
      setError("Please provide a campaign query");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.campaigns.createFromQuery({
        query: queryText,
        enhance_with_ai: true,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created from query successfully!");
        setTimeout(() => {
          router.push(`/campaigns/${result.data.campaign.id}/recommendations`);
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isOnboarding ? "Create Your First Campaign" : "Create Campaign"}
              </h1>
              <p className="text-gray-600 mt-1">
                Choose your preferred method to create a new campaign
              </p>
            </div>
          </div>

          {/* Creation Method Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === "form"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Enhanced Form
            </button>
            <button
              onClick={() => setActiveTab("document")}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === "document"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload Brief
            </button>
            <button
              onClick={() => setActiveTab("query")}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === "query"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              AI Query
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <p className="text-green-600 text-sm">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Enhanced Form Tab */}
        {activeTab === "form" && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3">
              <div className="space-y-8">
                {/* Basic Campaign Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Campaign Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Campaign Name"
                      placeholder="Enter campaign name"
                      value={formData.campaign_name}
                      onChange={(e) =>
                        handleInputChange("campaign_name", e.target.value)
                      }
                      required
                      icon={Megaphone}
                      containerClassName="md:col-span-2"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Type
                      </label>
                      <select
                        value={formData.campaign_type}
                        onChange={(e) =>
                          handleInputChange("campaign_type", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {campaignTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Location (Optional)"
                      placeholder="Event location or target region"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      icon={MapPin}
                    />

                    <Input
                      label="Budget"
                      type="number"
                      placeholder="5000"
                      value={formData.budget}
                      onChange={(e) =>
                        handleInputChange("budget", e.target.value)
                      }
                      icon={DollarSign}
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Start Date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      icon={Calendar}
                    />

                    <Input
                      label="End Date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      icon={Calendar}
                    />
                  </div>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Describe your campaign goals and requirements..."
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Objectives
                      </label>
                      <textarea
                        rows={2}
                        placeholder="What do you want to achieve with this campaign?"
                        value={formData.objectives}
                        onChange={(e) =>
                          handleInputChange("objectives", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Integrated Product Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-2" />
                    Product Information
                    <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Product Name"
                      placeholder="Enter product name"
                      value={formData.product_name}
                      onChange={(e) =>
                        handleInputChange("product_name", e.target.value)
                      }
                      icon={Package}
                    />

                    <Input
                      label="Product Price"
                      type="number"
                      placeholder="99.99"
                      value={formData.product_price}
                      onChange={(e) =>
                        handleInputChange("product_price", e.target.value)
                      }
                      icon={DollarSign}
                    />

                    <div className="md:col-span-2">
                      <div className="flex gap-4">
                        <Input
                          label="Product URL"
                          placeholder="https://yoursite.com/product"
                          value={formData.product_url}
                          onChange={(e) =>
                            handleInputChange("product_url", e.target.value)
                          }
                          icon={Globe}
                          helperText="We'll analyze your product page with AI"
                          containerClassName="flex-1"
                        />
                        <div className="pt-8">
                          <Button
                            variant="gradient"
                            onClick={analyzeProductUrl}
                            loading={isAnalyzing}
                            disabled={!formData.product_url.trim()}
                            icon={Brain}
                          >
                            {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Analysis Results */}
                  {productAnalysis && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-900">
                          AI Product Analysis Complete
                        </h4>
                      </div>
                      <p className="text-blue-700 text-sm">
                        Product analyzed successfully! Campaign fields have been auto-filled with AI insights.
                      </p>
                    </div>
                  )}
                </div>

                {/* Target Audience */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Users className="w-6 h-6 mr-2" />
                    Target Audience
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Demographics"
                      placeholder="e.g., young professionals, college students"
                      value={formData.target_audience.demographics}
                      onChange={(e) =>
                        handleInputChange("target_audience.demographics", e.target.value)
                      }
                    />

                    <Input
                      label="Interests"
                      placeholder="e.g., technology, fitness, travel"
                      value={formData.target_audience.interests}
                      onChange={(e) =>
                        handleInputChange("target_audience.interests", e.target.value)
                      }
                    />

                    <Input
                      label="Age Groups"
                      placeholder="e.g., 18-24, 25-34, 35-44"
                      value={formData.target_audience.age_groups}
                      onChange={(e) =>
                        handleInputChange("target_audience.age_groups", e.target.value)
                      }
                    />

                    <Input
                      label="Follower Range"
                      placeholder="e.g., 100K-300K, micro influencers"
                      value={formData.target_audience.follower_range}
                      onChange={(e) =>
                        handleInputChange("target_audience.follower_range", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Ready to Create Campaign?
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Campaign will be created with AI-powered creator recommendations
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <Button variant="ghost" onClick={() => router.back()}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleFormSubmit}
                        loading={isLoading}
                        icon={ArrowRight}
                        iconPosition="right"
                      >
                        Create Campaign
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Tips */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                  Enhanced Form Features
                </h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Product URL analysis automatically fills campaign details
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    AI generates targeting insights from product information
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    Location field enables geo-targeting for events
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    No separate product creation needed - everything integrated
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Document Upload Tab - Simplified for TXT files */}
        {activeTab === "document" && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Upload Campaign Brief
                </h2>
                <p className="text-gray-600">
                  Upload a TXT document and AI will extract campaign details automatically
                </p>
              </div>

              {!documentFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="document-upload"
                    className="hidden"
                    accept=".txt"
                    onChange={handleDocumentUpload}
                  />
                  <label htmlFor="document-upload" className="cursor-pointer">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Choose a TXT file or drag & drop
                    </p>
                    <p className="text-gray-500">
                      Currently supports TXT files up to 10MB. PDF support coming soon.
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {documentFile.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {(documentFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDocumentFile(null);
                          setDocumentPreview("");
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {documentPreview && (
                      <div className="bg-gray-50 rounded p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Preview:
                        </h4>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                          {documentPreview}
                          {documentPreview.length >= 500 && "..."}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      variant="primary"
                      onClick={handleDocumentSubmit}
                      loading={isLoading}
                      icon={Brain}
                      size="lg"
                    >
                      {isLoading ? "Creating Campaign..." : "Analyze & Create Campaign"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Query Tab */}
        {activeTab === "query" && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Query Input */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      AI Campaign Query
                    </h2>
                  </div>
                  <p className="text-gray-600">
                    Describe your campaign in natural language and AI will create it
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Description
                    </label>
                    <textarea
                      rows={12}
                      placeholder="Example: Heineken is looking for influencers to attend the F1 Movie Screening Event. Date - 23rd June, Location - Mumbai. We need Premium Lifestyle Influencers (100-300K following) with F1 and Beer connection, 25+ age. Budget: 70-80K per profile. Deliverables: Event Attendance, Instagram Reel, Story..."
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {queryText.length}/5000 characters
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={previewQueryExtraction}
                      loading={isAnalyzing}
                      disabled={queryText.length < 50}
                      icon={Eye}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleQuerySubmit}
                      loading={isLoading}
                      disabled={queryText.length < 50}
                      icon={Zap}
                    >
                      Create Campaign
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview Results */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Extraction Preview
                  </h3>
                </div>

                {!queryPreview ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Enter your campaign description and click "Preview" to see AI extraction
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">
                          Extraction Complete
                        </span>
                        <span className="ml-auto text-sm text-green-700">
                          Confidence: {queryPreview.confidence_score ? (queryPreview.confidence_score * 100).toFixed(0) + '%' : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Campaign Name:</span>
                          <p className="text-gray-600">{queryPreview.extracted_data?.campaign_name || "Not detected"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <p className="text-gray-600">{queryPreview.extracted_data?.campaign_type || "Not detected"}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Budget:</span>
                          <p className="text-gray-600">
                            {queryPreview.extracted_data?.budget 
                              ? `${queryPreview.extracted_data.currency || 'USD'} ${queryPreview.extracted_data.budget}`
                              : "Not detected"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600">{queryPreview.extracted_data?.location || "Not detected"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}