"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/authContext";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import {
  Megaphone,
  ArrowLeft,
  Package,
  Target,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  Eye,
  Lightbulb,
  TrendingUp,
  Brain,
  Sparkles,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../../lib/api";

export default function CampaignEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = params?.id;

  const [campaign, setCampaign] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_type: "sponsored_post",
    product_id: "",
    description: "",
    objectives: "",
    budget: "",
    currency: "USD",
    start_date: "",
    end_date: "",
    content_guidelines: "",
    hashtags: "",
    mention_requirements: "",
    approval_required: true,
    target_audience: {
      age_range: "",
      interests: "",
      demographics: "",
    },
  });

  const campaignTypes = [
    { value: "sponsored_post", label: "Sponsored Post" },
    { value: "brand_ambassador", label: "Brand Ambassador" },
    { value: "product_review", label: "Product Review" },
    { value: "event_coverage", label: "Event Coverage" },
    { value: "content_collaboration", label: "Content Collaboration" },
  ];

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
      fetchProducts();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.campaigns.getById(campaignId);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const campaignData = result.data.campaign;
        setCampaign(campaignData);

        // Populate form data
        setFormData({
          campaign_name: campaignData.campaign_name || "",
          campaign_type: campaignData.campaign_type || "sponsored_post",
          product_id: campaignData.product_id || "",
          description: campaignData.description || "",
          objectives: campaignData.objectives || "",
          budget: campaignData.budget?.toString() || "",
          currency: campaignData.currency || "USD",
          start_date: campaignData.start_date
            ? campaignData.start_date.split("T")[0]
            : "",
          end_date: campaignData.end_date
            ? campaignData.end_date.split("T")[0]
            : "",
          content_guidelines: campaignData.content_guidelines || "",
          hashtags: Array.isArray(campaignData.hashtags)
            ? campaignData.hashtags
                .map((h) => (h.startsWith("#") ? h : "#" + h))
                .join(", ")
            : campaignData.hashtags || "",
          mention_requirements: campaignData.mention_requirements || "",
          approval_required: campaignData.approval_required !== false, // Default to true
          target_audience: {
            age_range: campaignData.target_audience?.age_range || "",
            interests: campaignData.target_audience?.interests || "",
            demographics: campaignData.target_audience?.demographics || "",
          },
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

  const fetchProducts = async () => {
    try {
      const response = await apiClient.products.getMy();
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setProducts(result.data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

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

  const handleSave = async () => {
    if (!formData.campaign_name.trim()) {
      setError("Campaign name is required");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        hashtags: formData.hashtags
          ? formData.hashtags.split(",").map((h) => h.trim().replace(/^#/, ""))
          : [],
        product_id: formData.product_id || undefined,
        target_audience: Object.keys(formData.target_audience).some(
          (key) => formData.target_audience[key]
        )
          ? formData.target_audience
          : undefined,
      };

      const response = await apiClient.campaigns.update(campaignId, updateData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCampaign(result.data.campaign);
        setSuccessMessage("Campaign updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedProduct = () => {
    return products.find((p) => p.id === formData.product_id);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaign...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Campaign Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The campaign you're trying to edit doesn't exist or has been
            removed.
          </p>
          <Button variant="primary" onClick={() => router.push("/campaigns")}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const selectedProduct = getSelectedProduct();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => router.back()}
              className="mr-4"
            >
              Back
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Campaign
                </h1>
                <p className="text-gray-600 mt-1">
                  Update your campaign details and settings
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={Eye}
                onClick={() => router.push(`/campaigns/${campaignId}`)}
              >
                View Campaign
              </Button>

              <Button
                variant="primary"
                icon={Save}
                onClick={handleSave}
                loading={isSaving}
              >
                Save Changes
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="xl:col-span-3">
            <div className="space-y-8">
              {/* Basic Information */}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product (Optional)
                    </label>
                    <select
                      value={formData.product_id}
                      onChange={(e) =>
                        handleInputChange("product_id", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_name}
                        </option>
                      ))}
                    </select>
                  </div>

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
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
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
                      onChange={(e) =>
                        handleInputChange("hashtags", e.target.value)
                      }
                      helperText="Separate hashtags with commas"
                    />

                    <Input
                      label="Mention Requirements"
                      placeholder="@yourbrand"
                      value={formData.mention_requirements}
                      onChange={(e) =>
                        handleInputChange(
                          "mention_requirements",
                          e.target.value
                        )
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

              {/* Target Audience */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Users className="w-6 h-6 mr-2" />
                  Target Audience
                  {selectedProduct?.ai_overview && (
                    <span className="text-xs text-primary-600 ml-2">
                      (Product insights available)
                    </span>
                  )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    label="Age Groups"
                    placeholder="e.g., 18-24, 25-34, 35-44"
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

              {/* Save Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Save Changes
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Update your campaign with the latest information
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      loading={isSaving}
                      icon={Save}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Selected Product Preview */}
            {selectedProduct && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 text-primary-600 mr-2" />
                  Selected Product
                </h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedProduct.product_name}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {selectedProduct.description ||
                        "No description available"}
                    </p>
                  </div>

                  {selectedProduct.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-medium text-gray-900">
                        ${selectedProduct.price} {selectedProduct.currency}
                      </span>
                    </div>
                  )}

                  {selectedProduct.category && (
                    <div>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {selectedProduct.category}
                      </span>
                    </div>
                  )}

                  {selectedProduct.ai_overview && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-primary-600 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI insights available for better targeting
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>

              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={Save}
                  onClick={handleSave}
                  loading={isSaving}
                >
                  Save Changes
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  icon={Eye}
                  onClick={() => router.push(`/campaigns/${campaignId}`)}
                >
                  View Campaign
                </Button>

                <Button
                  variant="outline"
                  fullWidth
                  icon={Brain}
                  onClick={() =>
                    router.push(`/campaigns/${campaignId}/recommendations`)
                  }
                >
                  AI Recommendations
                </Button>

                <Button variant="ghost" fullWidth onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium capitalize">
                    {campaign.status || "draft"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {campaign.created_at
                      ? new Date(campaign.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {campaign.updated_at
                      ? new Date(campaign.updated_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign ID:</span>
                  <span className="font-mono text-xs">{campaign.id}</span>
                </div>
              </div>
            </div>

            {/* Edit Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                Edit Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Clear objectives help AI find the right creators for your
                  goals
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Detailed content guidelines ensure creator content aligns with
                  your brand
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Updating target audience improves creator-audience matching
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Save changes to get fresh AI recommendations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
