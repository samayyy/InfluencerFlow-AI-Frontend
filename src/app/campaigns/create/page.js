'use client'
import React, { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import CampaignAIPreview from "../CampaignAIPreview";
import {
  Megaphone,
  FileText,
  MessageSquare,
  Upload,
  Sparkles,
  Brain,
  Globe,
  Package,
  DollarSign,
  Calendar,
  Users,
  Target,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Eye,
  Wand2,
  Loader2,
  X,
  Info,
  Lightbulb,
} from "lucide-react";
import apiClient, { apiUtils, enhancedCampaignUtils } from "../../../lib/api";

export default function EnhancedCampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const isOnboarding = searchParams?.get("onboarding") === "true";

  // UI State
  const [activeTab, setActiveTab] = useState("form");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // AI Analysis State
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analysisMetadata, setAnalysisMetadata] = useState(null);

  // Form Data State
  const [formData, setFormData] = useState({
    // Campaign basics
    campaign_name: "",
    campaign_type: "sponsored_post",
    description: "",
    objectives: "",

    // Product information (integrated)
    product_name: "",
    product_url: "",
    product_price: "",
    product_currency: "USD",

    // Campaign details
    budget: "",
    currency: "USD",
    start_date: "",
    end_date: "",
    location: "",

    // Target audience
    target_audience: {
      demographics: "",
      age_range: "",
      interests: "",
      follower_range: "",
      location: "",
    },

    // Content requirements
    content_guidelines: "",
    hashtags: "",
    mention_requirements: "",
    approval_required: true,

    // Event specific
    event_date: "",
    event_location: "",
    event_type: "",
  });

  // Document Upload State
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [documentValidation, setDocumentValidation] = useState(null);

  // NLP Query State
  const [nlpQuery, setNlpQuery] = useState("");
  const [queryValidation, setQueryValidation] = useState(null);

  const campaignTypes = [
    { value: "sponsored_post", label: "Sponsored Post" },
    { value: "brand_ambassador", label: "Brand Ambassador" },
    { value: "product_review", label: "Product Review" },
    { value: "event_coverage", label: "Event Coverage" },
    { value: "content_collaboration", label: "Content Collaboration" },
    { value: "giveaway", label: "Giveaway" },
  ];

  // Helper Functions
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

  const handleDocumentUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = enhancedCampaignUtils.validateDocumentFile(file);
      setDocumentValidation(validation);

      if (validation.isValid) {
        setUploadedDocument(file);
        setError("");
      } else {
        setError(validation.errors[0]);
        setUploadedDocument(null);
      }
    }
  };

  const handleQueryChange = (value) => {
    setNlpQuery(value);
    const validation = enhancedCampaignUtils.validateCampaignData(
      { query_text: value },
      "query"
    );
    setQueryValidation(validation);

    if (!validation.isValid) {
      setError(validation.errors[0]);
    } else {
      setError("");
    }
  };

  // AI Analysis Functions
  const analyzeFormData = async () => {
    if (!formData.campaign_name.trim()) {
      setError("Campaign name is required");
      return;
    }

    setIsAnalyzing(true);
    try {
      const formattedData =
        enhancedCampaignUtils.formatCampaignForSubmission(formData);
      const response = await apiClient.campaigns.enhanced.previewFromForm(
        formattedData
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setAiAnalysis(result.data.preview);
        setAnalysisMetadata(result.data.analysis_metadata);
        setShowPreview(true);
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

  const analyzeDocument = async () => {
    if (!uploadedDocument) {
      setError("Please upload a document first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.campaigns.enhanced.createFromDocument(
        uploadedDocument
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created successfully from document!");
        setTimeout(() => {
          router.push(`/campaigns/${result.data.campaign.id}/recommendations`);
        }, 1500);
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

  const analyzeQuery = async () => {
    if (!nlpQuery.trim() || nlpQuery.length < 50) {
      setError(
        "Please provide a detailed campaign description (at least 50 characters)"
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.campaigns.enhanced.previewFromQuery(
        nlpQuery
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setAiAnalysis(result.data.preview);
        setAnalysisMetadata(result.data.analysis_metadata);
        setShowPreview(true);
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

  const analyzeUrlOnly = async () => {
    if (!formData.product_url.trim()) {
      setError("Please enter a product/brand website URL");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.campaigns.enhanced.previewFromUrl(
        formData.product_url
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setAiAnalysis(result.data.preview);
        setAnalysisMetadata(result.data.analysis_metadata);
        setShowPreview(true);
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

  // Campaign Creation Functions
  const createCampaignFromPreview = async () => {
    setIsCreating(true);
    try {
      let response;

      if (activeTab === "form") {
        const formattedData =
          enhancedCampaignUtils.formatCampaignForSubmission(formData);
        response = await apiClient.campaigns.enhanced.createFromForm(
          formattedData
        );
      } else if (activeTab === "query") {
        response = await apiClient.campaigns.enhanced.createFromQuery(nlpQuery);
      }

      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created successfully!");
        setShowPreview(false);

        setTimeout(() => {
          if (isOnboarding) {
            router.push(
              `/campaigns/${result.data.campaign.id}/recommendations?onboarding=true`
            );
          } else {
            router.push(
              `/campaigns/${result.data.campaign.id}/recommendations`
            );
          }
        }, 1500);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsCreating(false);
    }
  };

  const createCampaignDirectly = async () => {
    if (activeTab === "form") {
      return analyzeFormData(); // Show preview first for form
    } else if (activeTab === "document") {
      return analyzeDocument(); // Create directly for document
    } else if (activeTab === "query") {
      return analyzeQuery(); // Show preview first for query
    }
  };

  // Tab Content Components
  const FormCreationTab = () => (
    <div className="space-y-6">
      {/* Basic Campaign Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Campaign Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Campaign Name"
              placeholder="Enter campaign name"
              value={formData.campaign_name}
              onChange={(e) =>
                handleInputChange("campaign_name", e.target.value)
              }
              required
              icon={Megaphone}
            />
          </div>

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

          <div>
            <Input
              label="Budget per Creator"
              type="number"
              placeholder="50000"
              value={formData.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              icon={DollarSign}
            />
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Package className="w-6 h-6 mr-2" />
          Product Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Product Name"
              placeholder="Product name"
              value={formData.product_name}
              onChange={(e) =>
                handleInputChange("product_name", e.target.value)
              }
            />
          </div>

          <div>
            <Input
              label="Product Price"
              type="number"
              placeholder="99.99"
              value={formData.product_price}
              onChange={(e) =>
                handleInputChange("product_price", e.target.value)
              }
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <div className="flex-1">
              <Input
                label="Product/Brand Website"
                placeholder="https://yoursite.com"
                value={formData.product_url}
                onChange={(e) =>
                  handleInputChange("product_url", e.target.value)
                }
                icon={Globe}
              />
            </div>
            <div className="pt-8">
              <Button
                variant="secondary"
                onClick={analyzeUrlOnly}
                disabled={!formData.product_url || isAnalyzing}
                loading={isAnalyzing}
                icon={Brain}
              >
                {isAnalyzing ? "Analyzing..." : "Quick Analysis"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Campaign Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              icon={Calendar}
            />
          </div>

          <div>
            <Input
              label="End Date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              icon={Calendar}
            />
          </div>

          <div>
            <Input
              label="Event Date (if applicable)"
              type="date"
              value={formData.event_date}
              onChange={(e) => handleInputChange("event_date", e.target.value)}
              icon={Calendar}
            />
          </div>

          <div>
            <Input
              label="Location"
              placeholder="City, Country"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              icon={MapPin}
            />
          </div>
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
              onChange={(e) => handleInputChange("description", e.target.value)}
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
              onChange={(e) => handleInputChange("objectives", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Target Audience */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2" />
          Target Audience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            value={formData.target_audience.age_range}
            onChange={(e) =>
              handleInputChange("target_audience.age_range", e.target.value)
            }
          />
        </div>
      </div>

      {/* Content Guidelines */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Content Guidelines
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Guidelines
            </label>
            <textarea
              rows={3}
              placeholder="Provide guidelines for content creation..."
              value={formData.content_guidelines}
              onChange={(e) =>
                handleInputChange("content_guidelines", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Hashtags"
              placeholder="#brand, #campaign, #sponsored"
              value={formData.hashtags}
              onChange={(e) => handleInputChange("hashtags", e.target.value)}
              helperText="Separate hashtags with commas"
            />

            <Input
              label="Mention Requirements"
              placeholder="@yourbrand"
              value={formData.mention_requirements}
              onChange={(e) =>
                handleInputChange("mention_requirements", e.target.value)
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="approval_required"
              checked={formData.approval_required}
              onChange={(e) =>
                handleInputChange("approval_required", e.target.checked)
              }
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="approval_required"
              className="ml-2 text-sm text-gray-700"
            >
              Require content approval before posting
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const DocumentUploadTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Upload className="w-6 h-6 mr-2" />
        Upload Campaign Brief
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Campaign Document
        </h3>
        <p className="text-gray-600 mb-4">
          Upload a PDF, DOC, DOCX, or TXT file with your campaign brief. Our AI
          will extract all relevant information and create your campaign
          automatically.
        </p>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
        />

        <Button
          variant="primary"
          onClick={() => fileInputRef.current?.click()}
          icon={Upload}
        >
          Choose File
        </Button>

        {uploadedDocument && documentValidation?.isValid && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700 font-medium">
                {uploadedDocument.name}
              </span>
            </div>
            <div className="text-sm text-green-600 mb-4">
              <p>File size: {documentValidation.fileInfo.formattedSize}</p>
              <p>Type: {documentValidation.fileInfo.type}</p>
            </div>
            <Button
              variant="gradient"
              onClick={analyzeDocument}
              loading={isAnalyzing}
              icon={Wand2}
              className="w-full"
            >
              {isAnalyzing
                ? "Processing Document..."
                : "Create Campaign from Document"}
            </Button>
          </div>
        )}

        {documentValidation && !documentValidation.isValid && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">Upload Error</span>
            </div>
            <ul className="text-red-600 text-sm mt-2">
              {documentValidation.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Document Requirements:
        </h4>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Include campaign objectives, target audience, and budget</li>
          <li>• Mention specific deliverables and requirements</li>
          <li>• Add product/brand website URL for better analysis</li>
          <li>• Specify dates, locations, and any special instructions</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );

  const NLPQueryTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MessageSquare className="w-6 h-6 mr-2" />
        Describe Your Campaign
      </h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Description
        </label>
        <textarea
          rows={12}
          placeholder="Describe your campaign in detail. Include information about:
• Brand/product details and website
• Campaign objectives and type
• Target audience and demographics  
• Budget and timeline
• Specific requirements and deliverables
• Event details (if applicable)
• Any special instructions

Example: 'Heineken is looking for influencers to attend the red carpet F1 Movie Screening Event. Date: 23rd June, Location: Palladium, Lower Parel, Mumbai. Looking for Premium Lifestyle Influencers (100-300K following) with F1 and beer connection, 25+ age. Budget: 70-80K per profile. Website: https://heineken.com'"
          value={nlpQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {nlpQuery.length} characters (minimum 50 required)
          </span>
          <span
            className={`text-xs ${
              nlpQuery.length >= 50 ? "text-green-600" : "text-red-600"
            }`}
          >
            {nlpQuery.length >= 50 ? "✓ Sufficient detail" : "Need more detail"}
          </span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 mr-2" />
          AI Tips for Better Results:
        </h4>
        <ul className="text-yellow-700 text-sm space-y-1">
          <li>• Be as detailed as possible for better AI understanding</li>
          <li>• Include specific numbers (budget, follower counts, dates)</li>
          <li>• Mention brand website for enhanced analysis</li>
          <li>• Describe your target audience clearly</li>
          <li>• AI will intelligently fill missing details</li>
        </ul>
      </div>
    </div>
  );

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
                {isOnboarding
                  ? "Create Your First Campaign"
                  : "Create New Campaign"}
              </h1>
              <p className="text-gray-600 mt-1">
                Choose your preferred method and let AI help you create the
                perfect campaign
              </p>
            </div>
          </div>

          {isOnboarding && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-900 font-medium">Almost Done!</p>
                  <p className="text-green-700 text-sm">
                    After creating your campaign, you'll get AI-powered creator
                    recommendations based on your requirements.
                  </p>
                </div>
              </div>
            </div>
          )}
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
            <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Method Selection Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "form"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-5 h-5 mx-auto mb-2" />
              Enhanced Form
              <p className="text-xs text-gray-500 mt-1">
                Traditional form with AI assistance
              </p>
            </button>
            <button
              onClick={() => setActiveTab("document")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "document"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-2" />
              Document Upload
              <p className="text-xs text-gray-500 mt-1">
                Upload campaign brief document
              </p>
            </button>
            <button
              onClick={() => setActiveTab("query")}
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                activeTab === "query"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-2" />
              AI Description
              <p className="text-xs text-gray-500 mt-1">
                Describe in natural language
              </p>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-3">
            {activeTab === "form" && <FormCreationTab />}
            {activeTab === "document" && <DocumentUploadTab />}
            {activeTab === "query" && <NLPQueryTab />}

            {/* Action Buttons */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ready to Continue?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {activeTab === "form" &&
                      "Review your campaign details and get AI analysis"}
                    {activeTab === "document" &&
                      "Upload your document to create campaign automatically"}
                    {activeTab === "query" &&
                      "Describe your campaign and let AI create it for you"}
                  </p>
                </div>
                <div className="flex space-x-4">
                  <Button variant="ghost" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  {activeTab !== "document" && (
                    <Button
                      variant="primary"
                      onClick={createCampaignDirectly}
                      loading={isAnalyzing}
                      icon={activeTab === "form" ? Eye : Wand2}
                      iconPosition="right"
                    >
                      {isAnalyzing
                        ? "Analyzing..."
                        : activeTab === "form"
                        ? "Preview with AI"
                        : "Generate Campaign"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Method Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                {activeTab === "form" && "Enhanced Form Creation"}
                {activeTab === "document" && "Document Processing"}
                {activeTab === "query" && "AI-Powered Generation"}
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                {activeTab === "form" && (
                  <>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Complete control over all campaign details</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Real-time AI analysis of product/brand URLs</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Preview AI insights before creating campaign</span>
                    </div>
                  </>
                )}
                {activeTab === "document" && (
                  <>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Upload existing campaign briefs or documents</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>AI extracts all relevant campaign information</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Supports PDF, DOC, DOCX, and TXT files</span>
                    </div>
                  </>
                )}
                {activeTab === "query" && (
                  <>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Describe campaign in natural language</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>AI understands context and requirements</span>
                    </div>
                    <div className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        Intelligent gap filling for missing information
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* What's Next */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 text-green-600 mr-2" />
                What Happens Next?
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    1
                  </div>
                  <span>AI analyzes your campaign requirements</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    2
                  </div>
                  <span>Get brand insights and target audience analysis</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    3
                  </div>
                  <span>Receive personalized creator recommendations</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                    4
                  </div>
                  <span>Launch campaign with optimized strategy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Preview Modal */}
        {showPreview && aiAnalysis && (
          <CampaignAIPreview
            campaignData={formData}
            aiAnalysis={aiAnalysis}
            analysisMetadata={analysisMetadata}
            onConfirmCreate={createCampaignFromPreview}
            onCancel={() => setShowPreview(false)}
            onEdit={() => setShowPreview(false)}
            isLoading={isCreating}
          />
        )}
      </div>
    </div>
  );
}
