"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/authContext";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import {
  Package,
  ArrowLeft,
  Globe,
  DollarSign,
  Sparkles,
  Brain,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Eye,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Star,
  BarChart3,
  Award,
  Loader2,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../../lib/api";

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

  const [formData, setFormData] = useState({
    product_name: "",
    product_url: "",
    category: "",
    subcategory: "",
    price: "",
    currency: "USD",
    description: "",
    key_features: "",
    launch_date: "",
  });

  const [aiAnalysis, setAiAnalysis] = useState(null);

  const categories = [
    "Electronics",
    "Fashion",
    "Beauty",
    "Home & Garden",
    "Sports & Fitness",
    "Health & Wellness",
    "Food & Beverage",
    "Books & Media",
    "Toys & Games",
    "Automotive",
    "Software",
    "Other",
  ];

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.products.getById(productId);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const productData = result.data.product;
        setProduct(productData);

        // Populate form data
        setFormData({
          product_name: productData.product_name || "",
          product_url: productData.product_url || "",
          category: productData.category || "",
          subcategory: productData.subcategory || "",
          price: productData.price?.toString() || "",
          currency: productData.currency || "USD",
          description: productData.description || "",
          key_features: Array.isArray(productData.key_features)
            ? productData.key_features.join(", ")
            : productData.key_features || "",
          launch_date: productData.launch_date
            ? productData.launch_date.split("T")[0]
            : "",
        });

        // Set AI analysis if available
        if (productData.ai_overview) {
          setAiAnalysis(productData.ai_overview);
          setShowAIAnalysis(true);
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const analyzeProduct = async () => {
    if (!formData.product_url.trim() || !formData.product_name.trim()) {
      setError("Product name and URL are required for analysis");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await apiClient.products.analyzeUrl({
        product_url: formData.product_url,
        product_name: formData.product_name,
        brand_id: user.brand_id,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setAiAnalysis(result.data.ai_overview);
        setShowAIAnalysis(true);

        // Auto-fill form data from AI analysis
        if (result.data.ai_overview?.category_refined) {
          setFormData((prev) => ({
            ...prev,
            category: result.data.ai_overview.category_refined.includes(
              "Software"
            )
              ? "Software"
              : prev.category,
            description:
              result.data.ai_overview.product_summary || prev.description,
            key_features:
              result.data.ai_overview.key_features?.join(", ") ||
              prev.key_features,
          }));
        }

        setSuccessMessage("AI analysis complete! Product details updated.");
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
      const response = await apiClient.products.regenerateOverview(productId);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        await fetchProduct(); // Refresh the entire product data
        setSuccessMessage("AI analysis regenerated successfully!");
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

  const handleSave = async () => {
    if (!formData.product_name.trim()) {
      setError("Product name is required");
      return;
    }

    setIsSaving(true);
    try {
      const updateData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : undefined,
        key_features: formData.key_features
          ? formData.key_features.split(",").map((f) => f.trim())
          : [],
        ai_analysis: aiAnalysis, // Include updated AI analysis
      };

      const response = await apiClient.products.update(productId, updateData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setProduct(result.data.product);
        setSuccessMessage("Product updated successfully!");
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

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The product you're trying to edit doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

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
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Product
                </h1>
                <p className="text-gray-600 mt-1">
                  Update your product information and AI analysis
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                icon={Eye}
                onClick={() => router.push(`/products/${productId}`)}
              >
                View Product
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Product Details Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Product Details
                  </h2>

                  <div className="space-y-6">
                    <Input
                      label="Product Name"
                      placeholder="Enter your product name"
                      value={formData.product_name}
                      onChange={(e) =>
                        handleInputChange("product_name", e.target.value)
                      }
                      required
                      icon={Package}
                    />

                    <div className="flex gap-4">
                      <Input
                        label="Product URL"
                        placeholder="https://yoursite.com/product"
                        value={formData.product_url}
                        onChange={(e) =>
                          handleInputChange("product_url", e.target.value)
                        }
                        icon={Globe}
                        helperText="We'll analyze your product page to understand it better"
                        containerClassName="flex-1"
                      />

                      <div className="pt-8">
                        <Button
                          variant="gradient"
                          onClick={analyzeProduct}
                          loading={isAnalyzing}
                          disabled={
                            !formData.product_url.trim() ||
                            !formData.product_name.trim()
                          }
                          icon={Brain}
                        >
                          {isAnalyzing ? "Analyzing..." : "AI Analyze"}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange("category", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        label="Subcategory"
                        placeholder="e.g., Smartphones, Laptops"
                        value={formData.subcategory}
                        onChange={(e) =>
                          handleInputChange("subcategory", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        label="Price"
                        type="number"
                        placeholder="99.99"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
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
                        label="Launch Date"
                        type="date"
                        value={formData.launch_date}
                        onChange={(e) =>
                          handleInputChange("launch_date", e.target.value)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Description
                        {aiAnalysis && (
                          <span className="text-xs text-primary-600 ml-2">
                            (AI Enhanced)
                          </span>
                        )}
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe your product, its benefits, and what makes it unique..."
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <Input
                      label="Key Features"
                      placeholder="Feature 1, Feature 2, Feature 3"
                      value={formData.key_features}
                      onChange={(e) =>
                        handleInputChange("key_features", e.target.value)
                      }
                      helperText="Separate features with commas"
                    />
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-4">
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

              {/* AI Analysis Card */}
              {showAIAnalysis && aiAnalysis && (
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 animate-fade-in sticky top-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          AI Analysis
                        </h3>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateAI}
                        loading={isRegenerating}
                        icon={RefreshCw}
                      >
                        Refresh
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Product Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-2 text-primary-600" />
                          Summary
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed line-clamp-4">
                          {aiAnalysis.product_summary}
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-primary-600" />
                          Category
                        </h4>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          {aiAnalysis.category_refined}
                        </span>
                      </div>

                      {/* Appeal Score */}
                      {aiAnalysis.estimated_appeal_score && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2 text-primary-600" />
                            Creator Appeal Score
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                Score
                              </span>
                              <span className="text-lg font-bold text-primary-600">
                                {aiAnalysis.estimated_appeal_score}/10
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    aiAnalysis.estimated_appeal_score * 10
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Target Audience */}
                      {aiAnalysis.target_audience && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Users className="w-4 h-4 mr-2 text-primary-600" />
                            Target Audience
                          </h4>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {aiAnalysis.target_audience.primary_demographics}
                            </p>
                            {aiAnalysis.target_audience.age_groups && (
                              <div className="flex flex-wrap gap-1">
                                {aiAnalysis.target_audience.age_groups
                                  .slice(0, 3)
                                  .map((age, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                    >
                                      {age}
                                    </span>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Collaboration Recommendations */}
                      {aiAnalysis.collaboration_recommendations && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-primary-600" />
                            Creator Recommendations
                          </h4>
                          <div className="text-sm text-gray-700 space-y-1">
                            {aiAnalysis.collaboration_recommendations
                              .slice(0, 3)
                              .map((rec, index) => (
                                <div key={index} className="flex items-start">
                                  <span className="text-primary-600 mr-2">
                                    •
                                  </span>
                                  <span className="line-clamp-2">{rec}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-3 bg-white/70 rounded-lg">
                      <p className="text-xs text-gray-600 flex items-center">
                        <Sparkles className="w-3 h-3 text-primary-600 mr-1" />
                        AI analysis helps match your product with the right
                        creators
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
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
                  onClick={() => router.push(`/products/${productId}`)}
                >
                  View Product
                </Button>

                {showAIAnalysis && (
                  <Button
                    variant="outline"
                    fullWidth
                    icon={RefreshCw}
                    onClick={handleRegenerateAI}
                    loading={isRegenerating}
                  >
                    Regenerate AI Analysis
                  </Button>
                )}

                <Button variant="ghost" fullWidth onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Product ID:</span>
                  <span className="font-mono text-xs">{product.id}</span>
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
                  Use AI analysis to automatically enhance your product
                  description and features
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Keep product information updated to improve campaign matching
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Detailed features help creators understand your product better
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Regular AI regeneration keeps insights fresh and accurate
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
