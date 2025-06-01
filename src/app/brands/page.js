"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button.js";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import {
  Building2,
  Globe,
  Edit3,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Loader2,
  Brain,
  Target,
  Lightbulb,
  Zap,
  Eye,
  Award,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api.js";

export default function EnhancedBrandManagementPage() {
  const { user, updateUser } = useAuth();
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [editForm, setEditForm] = useState({
    brand_name: "",
    website_url: "",
    industry: "",
    company_size: "",
    description: "",
    monthly_budget: "",
    currency: "USD",
  });

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

  useEffect(() => {
    fetchBrandProfile();
  }, []);

  const fetchBrandProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.brands.getProfile();
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setBrand(result.data.brand);
        setEditForm({
          brand_name: result.data.brand.brand_name || "",
          website_url: result.data.brand.website_url || "",
          industry: result.data.brand.industry || "",
          company_size: result.data.brand.company_size || "",
          description: result.data.brand.description || "",
          monthly_budget: result.data.brand.monthly_budget || "",
          currency: result.data.brand.currency || "USD",
        });
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

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleSave = async () => {
    if (!editForm.brand_name.trim()) {
      setError("Brand name is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.brands.update(brand.id, editForm);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setBrand(result.data.brand);
        setIsEditing(false);
        setSuccessMessage("Brand profile updated successfully!");

        if (editForm.brand_name !== brand.brand_name) {
          updateUser({ brand_name: editForm.brand_name });
        }

        setTimeout(() => setSuccessMessage(""), 3000);
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

  const handleAnalyzeWebsite = async () => {
    if (!editForm.website_url.trim()) {
      setError("Website URL is required for analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.brands.analyzeWebsite(
        editForm.website_url,
        editForm.brand_name
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        if (result.data.ai_overview?.overview) {
          setEditForm((prev) => ({
            ...prev,
            description: result.data.ai_overview.overview,
          }));
        }
        setSuccessMessage("Website analysis complete! Description updated.");
        setTimeout(() => setSuccessMessage(""), 3000);
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

  const handleRegenerateAI = async () => {
    setIsRegenerating(true);
    try {
      const response = await apiClient.brands.regenerateAI(brand.id);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        await fetchBrandProfile();
        setSuccessMessage("AI overview regenerated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (isLoading && !brand) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading brand profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Brand Profile Found
          </h3>
          <p className="text-gray-600 mb-6">
            You haven't set up your brand profile yet. Complete the onboarding
            process to get started.
          </p>
          <Button variant="primary" href="/onboarding">
            Complete Setup
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="w-8 h-8 mr-3" />
              Brand Profile
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your brand information and AI-powered insights
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {brand.website_url && (
              <Button
                variant="ghost"
                icon={ExternalLink}
                onClick={() => window.open(brand.website_url, "_blank")}
              >
                Visit Website
              </Button>
            )}
            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          </div>
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
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Brand Info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Brand Overview Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {brand.brand_name}
                  </h2>
                  <p className="text-gray-600">{brand.industry}</p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${getVerificationStatusColor(brand.verification_status)}
                    `}
                    >
                      {brand.verification_status || "unverified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Website</h4>
                {brand.website_url ? (
                  <a
                    href={brand.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    {brand.website_url}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                ) : (
                  <p className="text-gray-500">No website URL provided</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Company Size</h4>
                <p className="text-gray-600">
                  {companySizes.find(
                    (size) => size.value === brand.company_size
                  )?.label || brand.company_size}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Monthly Budget
                </h4>
                <p className="text-gray-600">
                  {brand.monthly_budget
                    ? formatCurrency(brand.monthly_budget, brand.currency)
                    : "Not specified"}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                <p className="text-gray-600">
                  {new Date(brand.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Brand Description
            </h3>
            {brand.description ? (
              <p className="text-gray-600 leading-relaxed">
                {brand.description}
              </p>
            ) : (
              <p className="text-gray-500 italic">No description provided</p>
            )}
          </div>

          {/* AI-Generated Overview */}
          {brand.ai_overview && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Brain className="w-6 h-6 text-primary-600 mr-2" />
                  AI Brand Analysis
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateAI}
                  loading={isRegenerating}
                  icon={RefreshCw}
                >
                  Regenerate
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {brand.ai_overview.overview && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Eye className="w-4 h-4 mr-2 text-primary-600" />
                        Brand Overview
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {brand.ai_overview.overview}
                      </p>
                    </div>
                  )}

                  {brand.ai_overview.market_position && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Award className="w-4 h-4 mr-2 text-primary-600" />
                        Market Position
                      </h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {brand.ai_overview.market_position}
                      </p>
                    </div>
                  )}

                  {brand.ai_overview.target_audience && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-primary-600" />
                        Target Audience
                      </h4>
                      <p className="text-gray-700 text-sm mb-2">
                        {brand.ai_overview.target_audience.demographics}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {brand.ai_overview.target_audience.interests?.map(
                          (interest, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {brand.ai_overview.products_services && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-primary-600" />
                        Products & Services
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {brand.ai_overview.products_services.map(
                          (service, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {brand.ai_overview.brand_personality && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 mr-2 text-primary-600" />
                        Brand Personality
                      </h4>
                      <div className="text-sm text-gray-700 space-y-1">
                        {brand.ai_overview.brand_personality.tone && (
                          <p>
                            <strong>Tone:</strong>{" "}
                            {brand.ai_overview.brand_personality.tone}
                          </p>
                        )}
                        {brand.ai_overview.brand_personality.style && (
                          <p>
                            <strong>Style:</strong>{" "}
                            {brand.ai_overview.brand_personality.style}
                          </p>
                        )}
                        {brand.ai_overview.brand_personality.values && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {brand.ai_overview.brand_personality.values.map(
                              (value, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                >
                                  {value}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {brand.ai_overview.collaboration_fit && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-primary-600" />
                        Creator Collaboration Fit
                      </h4>
                      <div className="text-sm text-gray-700">
                        <p className="mb-2">
                          <strong>Ideal Creators:</strong>{" "}
                          {brand.ai_overview.collaboration_fit.ideal_creators}
                        </p>
                        <div className="space-y-2">
                          {brand.ai_overview.collaboration_fit
                            .content_types && (
                            <div>
                              <span className="font-medium">
                                Content Types:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {brand.ai_overview.collaboration_fit.content_types.map(
                                  (type, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                    >
                                      {type}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                          {brand.ai_overview.collaboration_fit
                            .campaign_styles && (
                            <div>
                              <span className="font-medium">
                                Campaign Styles:
                              </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {brand.ai_overview.collaboration_fit.campaign_styles.map(
                                  (style, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                                    >
                                      {style}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Messaging & Competitive Advantages */}
              {(brand.ai_overview.key_messaging ||
                brand.ai_overview.competitive_advantages) && (
                <div className="mt-6 pt-6 border-t border-primary-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {brand.ai_overview.key_messaging && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <MessageSquare className="w-4 h-4 mr-2 text-primary-600" />
                          Key Messaging
                        </h4>
                        <ul className="space-y-1">
                          {brand.ai_overview.key_messaging.map(
                            (message, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                • {message}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                    {brand.ai_overview.competitive_advantages && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-primary-600" />
                          Competitive Advantages
                        </h4>
                        <ul className="space-y-1">
                          {brand.ai_overview.competitive_advantages.map(
                            (advantage, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                • {advantage}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Brand Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Active Campaigns
                  </span>
                </div>
                <span className="font-medium text-gray-900">5</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Creators Worked With
                  </span>
                </div>
                <span className="font-medium text-gray-900">23</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">
                    Avg. Campaign Rating
                  </span>
                </div>
                <span className="font-medium text-gray-900">4.8</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">Brand profile updated</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">New campaign created</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm text-gray-900">
                    AI overview regenerated
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Brand Profile"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isLoading}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="Brand Name"
            value={editForm.brand_name}
            onChange={(e) => handleInputChange("brand_name", e.target.value)}
            required
            icon={Building2}
          />

          <div className="flex gap-4">
            <Input
              label="Website URL"
              value={editForm.website_url}
              onChange={(e) => handleInputChange("website_url", e.target.value)}
              icon={Globe}
              containerClassName="flex-1"
            />
            <div className="pt-8">
              <Button
                variant="outline"
                onClick={handleAnalyzeWebsite}
                loading={isAnalyzing}
                disabled={!editForm.website_url.trim()}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <select
              value={editForm.industry}
              onChange={(e) => handleInputChange("industry", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select industry</option>
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
              value={editForm.company_size}
              onChange={(e) =>
                handleInputChange("company_size", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              Description
            </label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your brand..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Monthly Budget"
              type="number"
              value={editForm.monthly_budget}
              onChange={(e) =>
                handleInputChange("monthly_budget", e.target.value)
              }
              icon={DollarSign}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={editForm.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
