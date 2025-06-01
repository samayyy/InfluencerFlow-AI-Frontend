"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import {
  Megaphone,
  Package,
  Target,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Eye,
  TrendingUp,
  MessageSquare,
  Star,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

export default function CampaignCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const isOnboarding = searchParams?.get("onboarding") === "true";
  const preSelectedProductId = searchParams?.get("product_id");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [formData, setFormData] = useState({
    campaign_name: "",
    campaign_type: "sponsored_post",
    product_id: preSelectedProductId || "",
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
    fetchProducts();
  }, []);

  useEffect(() => {
    if (preSelectedProductId && products.length > 0) {
      const product = products.find((p) => p.id === preSelectedProductId);
      if (product) {
        setSelectedProduct(product);
        prefillFromProduct(product);
      }
    }
  }, [preSelectedProductId, products]);

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

  const prefillFromProduct = (product) => {
    setFormData((prev) => ({
      ...prev,
      campaign_name: `${product.product_name} Campaign`,
      description: `Promote our ${product.product_name} to reach new audiences and drive engagement.`,
      objectives: `Increase awareness and sales for ${product.product_name}`,
      hashtags: `#${product.product_name.replace(
        /\s+/g,
        ""
      )}, #sponsored, #brand`,
      mention_requirements: `@${
        user?.brand_name?.replace(/\s+/g, "") || "yourbrand"
      }`,
    }));

    // If product has AI analysis, use it for targeting
    if (product.ai_overview?.target_audience) {
      const targetAudience = product.ai_overview.target_audience;
      setFormData((prev) => ({
        ...prev,
        target_audience: {
          demographics: targetAudience.primary_demographics || "",
          interests: targetAudience.interests?.join(", ") || "",
          age_range: targetAudience.age_groups?.join(", ") || "",
        },
      }));
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

  const handleProductChange = (productId) => {
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
    setFormData((prev) => ({ ...prev, product_id: productId }));

    if (product) {
      prefillFromProduct(product);
    }
  };

  const handleSubmit = async () => {
    if (!formData.campaign_name.trim()) {
      setError("Campaign name is required");
      return;
    }

    setIsLoading(true);
    try {
      const campaignData = {
        ...formData,
        brand_id: user.brand_id,
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

      const response = await apiClient.campaigns.create(campaignData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Campaign created successfully!");

        // Redirect based on context
        if (isOnboarding) {
          setTimeout(() => {
            router.push(
              `/campaigns/${result.data.campaign.id}?onboarding=true`
            );
          }, 1000);
        } else {
          setTimeout(() => {
            const viewRecommendations = confirm(
              "Campaign created! Would you like to view AI creator recommendations now?"
            );
            if (viewRecommendations) {
              router.push(
                `/campaigns/${result.data.campaign.id}/recommendations`
              );
            } else {
              router.push("/campaigns");
            }
          }, 1000);
        }
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
                {isOnboarding
                  ? "Create Your First Campaign"
                  : "Create New Campaign"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isOnboarding
                  ? "Set up your campaign and get AI-powered creator recommendations"
                  : "Launch a new influencer marketing campaign"}
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
                    recommendations based on your product and target audience.
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
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select a product</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.product_name}
                        </option>
                      ))}
                    </select>
                    {products.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No products found.{" "}
                        <button
                          onClick={() => router.push("/products/create")}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Create one first
                        </button>
                      </p>
                    )}
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
                      (Auto-filled from product)
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

              {/* Submit Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Ready to Launch?
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Your campaign will be created and you'll get AI-powered
                      creator recommendations
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmit}
                      loading={isLoading}
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      {isOnboarding
                        ? "Create & Get Recommendations"
                        : "Create Campaign"}
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
                        AI insights will be used for creator matching
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Campaign Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 text-yellow-500 mr-2" />
                Campaign Tips
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
                  Target audience info improves creator-audience matching
                  accuracy
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Setting a realistic budget helps find creators within your
                  range
                </li>
              </ul>
            </div>

            {/* AI Features Preview */}
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-primary-600 mr-2" />
                AI Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <Eye className="w-4 h-4 text-primary-600 mr-2" />
                  Smart creator discovery
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Target className="w-4 h-4 text-primary-600 mr-2" />
                  Audience alignment matching
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <TrendingUp className="w-4 h-4 text-primary-600 mr-2" />
                  Performance predictions
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MessageSquare className="w-4 h-4 text-primary-600 mr-2" />
                  Automated outreach
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Star className="w-4 h-4 text-primary-600 mr-2" />
                  Quality scoring
                </div>
              </div>
            </div>

            {/* Next Steps */}
            {isOnboarding && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  After Campaign Creation
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      1
                    </div>
                    <span>Get AI creator recommendations</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      2
                    </div>
                    <span>Review and select creators</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      3
                    </div>
                    <span>Send automated outreach</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      4
                    </div>
                    <span>Track campaign performance</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
