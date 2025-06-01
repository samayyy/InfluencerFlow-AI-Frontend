// src/app/products/create/page.js

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import {
  Package,
  Globe,
  DollarSign,
  Sparkles,
  Brain,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Eye,
  Target,
  Lightbulb,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Star,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

export default function ProductCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleSubmit = async () => {
    if (!formData.product_name.trim()) {
      setError("Product name is required");
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        ...formData,
        brand_id: user.brand_id,
        price: formData.price ? parseFloat(formData.price) : undefined,
        key_features: formData.key_features
          ? formData.key_features.split(",").map((f) => f.trim())
          : [],
        ai_analysis: aiAnalysis, // Include AI analysis
      };

      const response = await apiClient.products.create(productData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage("Product created successfully!");

        // Redirect based on context
        if (isOnboarding) {
          // After onboarding, go to campaign creation
          setTimeout(() => {
            router.push(
              "/campaigns?onboarding=true&product_id=" + result.data.product.id
            );
          }, 1000);
        } else {
          // Regular flow, go to products page
          setTimeout(() => {
            router.push("/products");
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isOnboarding ? "Add Your First Product" : "Create New Product"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isOnboarding
                  ? "Add a product to start creating targeted campaigns"
                  : "Add a new product to your catalog"}
              </p>
            </div>
          </div>

          {isOnboarding && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-blue-900 font-medium">Getting Started</p>
                  <p className="text-blue-700 text-sm">
                    After adding your product, we'll help you create your first
                    campaign with AI-powered creator recommendations.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
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
                    onChange={(e) => handleInputChange("price", e.target.value)}
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
                    onClick={handleSubmit}
                    loading={isLoading}
                    icon={ArrowRight}
                    iconPosition="right"
                  >
                    {isOnboarding ? "Create & Continue" : "Create Product"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis Sidebar */}
          <div className="space-y-6">
            {/* Quick Tips */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
                Quick Tips
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Add a product URL for AI-powered analysis and better campaign
                  matching
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Detailed descriptions help us find the perfect creators for
                  your campaigns
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  Key features will be highlighted to creators during outreach
                </li>
              </ul>
            </div>

            {/* AI Analysis Results */}
            {showAIAnalysis && aiAnalysis && (
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 animate-fade-in">
                <div className="flex items-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    AI Product Analysis
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* Product Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Eye className="w-4 h-4 mr-2 text-primary-600" />
                      Product Summary
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {aiAnalysis.product_summary}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-primary-600" />
                      Refined Category
                    </h4>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {aiAnalysis.category_refined}
                    </span>
                  </div>

                  {/* Target Audience */}
                  {aiAnalysis.target_audience && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-primary-600" />
                        Target Audience
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">
                        {aiAnalysis.target_audience.primary_demographics}
                      </p>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Age Groups:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {aiAnalysis.target_audience.age_groups?.map(
                              (age, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                >
                                  {age}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600">
                            Interests:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {aiAnalysis.target_audience.interests?.map(
                              (interest, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full"
                                >
                                  {interest}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appeal Score */}
                  {aiAnalysis.estimated_appeal_score && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-primary-600" />
                        Creator Appeal Score
                      </h4>
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full"
                            style={{
                              width: `${
                                aiAnalysis.estimated_appeal_score * 10
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {aiAnalysis.estimated_appeal_score}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Based on current market trends and creator preferences
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
