"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  Package,
  ArrowLeft,
  Edit3,
  Globe,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Brain,
  Eye,
  Lightbulb,
  BarChart3,
  Award,
  Megaphone,
  RefreshCw,
  Plus,
  FileText,
  Star,
  Zap,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const productId = params?.id;

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        setProduct(result.data.product);
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

  const handleRegenerateAI = async () => {
    setIsRegenerating(true);
    try {
      const response = await apiClient.products.regenerateOverview(productId);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        await fetchProduct();
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

  const handleCreateCampaign = () => {
    router.push(`/campaigns/create?product_id=${product.id}`);
  };

  const formatCurrency = (amount, currency = "USD") => {
    if (!amount) return "Price not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => router.push("/products")}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
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
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {product.product_name}
              </h1>
              <p className="text-gray-600 mt-1">
                {product.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              icon={Megaphone}
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </Button>

            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => router.push(`/products/${product.id}/edit`)}
            >
              Edit Product
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Product Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Category</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {product.category || "Not specified"}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Price</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {formatCurrency(product.price, product.currency)}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Launch Date</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {formatDate(product.launch_date)}
                </p>
              </div>
            </div>

            {product.product_url && (
              <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Product URL
                  </h4>
                  <p className="text-gray-600 text-sm">{product.product_url}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ExternalLink}
                  onClick={() => window.open(product.product_url, "_blank")}
                >
                  Visit
                </Button>
              </div>
            )}
          </div>

          {/* Key Features */}
          {product.key_features && product.key_features.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Key Features
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.key_features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Analysis */}
          {product.ai_overview && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Brain className="w-6 h-6 text-primary-600 mr-2" />
                  AI Product Analysis
                </h2>
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

              <div className="space-y-6">
                {/* Product Summary */}
                {product.ai_overview.product_summary && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-primary-600" />
                      Product Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-white/70 p-4 rounded-lg">
                      {product.ai_overview.product_summary}
                    </p>
                  </div>
                )}

                {/* Category Refinement */}
                {product.ai_overview.category_refined && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-primary-600" />
                      Refined Category
                    </h3>
                    <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
                      {product.ai_overview.category_refined}
                    </span>
                  </div>
                )}

                {/* Target Audience */}
                {product.ai_overview.target_audience && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-primary-600" />
                      Target Audience Analysis
                    </h3>
                    <div className="bg-white/70 p-4 rounded-lg space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">
                          Primary Demographics
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {
                            product.ai_overview.target_audience
                              .primary_demographics
                          }
                        </p>
                      </div>

                      {product.ai_overview.target_audience.age_groups && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Age Groups
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {product.ai_overview.target_audience.age_groups.map(
                              (age, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full"
                                >
                                  {age}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {product.ai_overview.target_audience.interests && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Key Interests
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {product.ai_overview.target_audience.interests.map(
                              (interest, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full"
                                >
                                  {interest}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {product.ai_overview.target_audience
                        .purchase_behavior && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Purchase Behavior
                          </h4>
                          <p className="text-gray-700 text-sm">
                            {
                              product.ai_overview.target_audience
                                .purchase_behavior
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Creator Appeal Score */}
                {product.ai_overview.estimated_appeal_score && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary-600" />
                      Creator Appeal Score
                    </h3>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-700">Appeal Rating</span>
                        <span className="text-2xl font-bold text-primary-600">
                          {product.ai_overview.estimated_appeal_score}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              product.ai_overview.estimated_appeal_score * 10
                            }%`,
                          }}
                        />
                      </div>
                      <p className="text-gray-600 text-sm">
                        Based on current market trends and creator preferences
                      </p>
                    </div>
                  </div>
                )}

                {/* Market Positioning */}
                {product.ai_overview.market_positioning && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                      Market Positioning
                    </h3>
                    <div className="bg-white/70 p-4 rounded-lg space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">
                          Position
                        </h4>
                        <p className="text-gray-700 text-sm">
                          {product.ai_overview.market_positioning.position}
                        </p>
                      </div>

                      {product.ai_overview.market_positioning
                        .differentiators && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">
                            Key Differentiators
                          </h4>
                          <div className="space-y-1">
                            {product.ai_overview.market_positioning.differentiators.map(
                              (diff, index) => (
                                <div key={index} className="flex items-start">
                                  <span className="text-primary-600 mr-2">
                                    •
                                  </span>
                                  <span className="text-gray-700 text-sm">
                                    {diff}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Collaboration Recommendations */}
                {product.ai_overview.collaboration_recommendations && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-primary-600" />
                      Creator Collaboration Recommendations
                    </h3>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <div className="space-y-2">
                        {product.ai_overview.collaboration_recommendations.map(
                          (rec, index) => (
                            <div
                              key={index}
                              className="flex items-start p-3 bg-blue-50 rounded-lg"
                            >
                              <Award className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">
                                {rec}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Content Ideas */}
                {product.ai_overview.content_ideas && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-primary-600" />
                      Content Ideas
                    </h3>
                    <div className="bg-white/70 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {product.ai_overview.content_ideas.map(
                          (idea, index) => (
                            <div
                              key={index}
                              className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                            >
                              <p className="text-gray-700 text-sm">{idea}</p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                icon={Megaphone}
                onClick={handleCreateCampaign}
              >
                Create Campaign
              </Button>

              <Button
                variant="outline"
                fullWidth
                icon={Edit3}
                onClick={() => router.push(`/products/${product.id}/edit`)}
              >
                Edit Product
              </Button>

              {product.ai_overview && (
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

              {product.product_url && (
                <Button
                  variant="outline"
                  fullWidth
                  icon={ExternalLink}
                  onClick={() => window.open(product.product_url, "_blank")}
                >
                  Visit Product Page
                </Button>
              )}
            </div>
          </div>

          {/* Product Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Product Information
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <span className="font-medium text-gray-900">
                  {product.category || "Not set"}
                </span>
              </div>

              {product.subcategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subcategory</span>
                  <span className="font-medium text-gray-900">
                    {product.subcategory}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(product.price, product.currency)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="font-medium text-gray-900">
                  {formatDate(product.created_at)}
                </span>
              </div>

              {product.launch_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Launch Date</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(product.launch_date)}
                  </span>
                </div>
              )}

              {product.ai_overview?.estimated_appeal_score && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creator Appeal</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-gray-900">
                      {product.ai_overview.estimated_appeal_score}/10
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Features */}
          {product.ai_overview && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                AI Insights Available
              </h3>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Product summary & positioning
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Target audience analysis
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Creator appeal scoring
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Collaboration recommendations
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Content ideas & strategies
                </div>
              </div>
            </div>
          )}

          {/* Related Campaigns */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Related Campaigns
            </h3>

            <div className="text-center py-6">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm mb-4">
                No campaigns yet for this product
              </p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleCreateCampaign}
              >
                Create First Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
