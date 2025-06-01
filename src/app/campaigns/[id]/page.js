"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import {
  Megaphone,
  ArrowLeft,
  Edit3,
  Users,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Settings,
  BarChart3,
  Eye,
  MessageSquare,
  Share,
  Star,
  Brain,
  Sparkles,
  Zap,
  Mail,
  PhoneCall,
  ExternalLink,
  RefreshCw,
  Download,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const campaignId = params?.id;
  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [campaign, setCampaign] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] =
    useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
      // Auto-show recommendations if onboarding
      if (isOnboarding) {
        setTimeout(() => {
          handleGetRecommendations();
        }, 1000);
      }
    }
  }, [campaignId, isOnboarding]);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.campaigns.getById(campaignId);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCampaign(result.data.campaign);
        // Check if recommendations already exist
        if (result.data.campaign.ai_recommended_influencers) {
          setRecommendations(result.data.campaign.ai_recommended_influencers);
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

  const handleGetRecommendations = async (fresh = false) => {
    setIsLoadingRecommendations(true);
    try {
      const response = await apiClient.campaigns.getRecommendations(
        campaignId,
        {
          fresh: fresh.toString(),
          limit: 20,
        }
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setRecommendations(result.data.recommendations);
        // Route to recommendations page instead of showing modal
        router.push(
          `/campaigns/${campaignId}/recommendations${
            isOnboarding ? "?onboarding=true" : ""
          }`
        );
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  const handleContactCreator = async (creator) => {
    try {
      const response = await apiClient.mail.sendBrandCollab(
        [creator.id],
        user?.brand_name || "Your Brand"
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage(`Email sent to ${creator.creator_name}!`);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "paused":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return Play;
      case "paused":
        return Pause;
      case "completed":
        return CheckCircle;
      case "cancelled":
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const formatCurrency = (amount, currency = "USD") => {
    if (!amount) return "Budget not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const getEngagementColor = (rate) => {
    if (rate >= 6) return "text-green-600";
    if (rate >= 3) return "text-blue-600";
    if (rate >= 1) return "text-yellow-600";
    return "text-red-600";
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
            The campaign you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => router.push("/campaigns")}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(campaign.status);

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

        {isOnboarding && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-900 font-medium">
                  Campaign Created Successfully!
                </p>
                <p className="text-green-700 text-sm">
                  Your setup is complete. Now get AI-powered creator
                  recommendations to start your first campaign.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                {campaign.campaign_name}
                <span
                  className={`
                  inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ml-4
                  ${getStatusColor(campaign.status)}
                `}
                >
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {campaign.status || "draft"}
                </span>
              </h1>
              <p className="text-gray-600 mt-1">
                {campaign.description || "No description provided"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="gradient"
              icon={Brain}
              onClick={() => handleGetRecommendations(false)}
              loading={isLoadingRecommendations}
            >
              {recommendations ? "View" : "Get"} AI Recommendations
            </Button>

            <Button
              variant="outline"
              icon={Edit3}
              onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
            >
              Edit Campaign
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
          {/* Campaign Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Campaign Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">Campaign Type</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {campaign.campaign_type?.replace(/_/g, " ") ||
                    "Not specified"}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900">Budget</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {formatCurrency(campaign.budget, campaign.currency)}
                </p>
              </div>

              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900">Duration</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {formatDate(campaign.start_date)} -{" "}
                  {formatDate(campaign.end_date)}
                </p>
              </div>
            </div>

            {campaign.objectives && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Objectives</h4>
                <p className="text-gray-700 text-sm">{campaign.objectives}</p>
              </div>
            )}
          </div>

          {/* Product Information */}
          {campaign.product_name && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-2" />
                Featured Product
              </h2>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {campaign.product_name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Featured in this campaign
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content Guidelines */}
          {campaign.content_guidelines && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Content Guidelines
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {campaign.content_guidelines}
              </p>

              {(campaign.hashtags?.length > 0 ||
                campaign.mention_requirements) && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.hashtags?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Required Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {campaign.hashtags.map((hashtag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                          >
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {campaign.mention_requirements && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Mentions
                      </h4>
                      <p className="text-gray-700 text-sm font-mono bg-gray-50 px-3 py-2 rounded">
                        {campaign.mention_requirements}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Recommendations Summary */}
          {recommendations && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
                  AI Recommendations Available
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  icon={RefreshCw}
                  onClick={() => handleGetRecommendations(true)}
                  loading={isLoadingRecommendations}
                >
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {recommendations.total_found || 0}
                  </p>
                  <p className="text-sm text-gray-600">Creators Found</p>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {recommendations.budget_filtered || 0}
                  </p>
                  <p className="text-sm text-gray-600">Budget Matches</p>
                </div>
                <div className="text-center p-3 bg-white/70 rounded-lg">
                  <p className="text-2xl font-bold text-primary-600">
                    {recommendations.recommendations?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Top Matches</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  onClick={() =>
                    router.push(`/campaigns/${campaignId}/recommendations`)
                  }
                  icon={Eye}
                  fullWidth
                >
                  View All AI Recommendations
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGetRecommendations(true)}
                  icon={RefreshCw}
                  loading={isLoadingRecommendations}
                >
                  Generate Fresh
                </Button>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-primary-600">
                  ✨ Powered by advanced AI algorithms analyzing 18 creators
                  with{" "}
                  {Math.round(
                    (recommendations.search_metadata?.confidence_score || 0.9) *
                      100
                  )}
                  % confidence
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          <Button
            variant="primary"
            fullWidth
            icon={Brain}
            onClick={() =>
              router.push(`/campaigns/${campaignId}/recommendations`)
            }
          >
            {recommendations ? "View" : "Get"} AI Recommendations
          </Button>

          <Button
            variant="outline"
            fullWidth
            icon={Edit3}
            onClick={() => router.push(`/campaigns/${campaign.id}/edit`)}
          >
            Edit Campaign
          </Button>

          <Button variant="outline" fullWidth icon={BarChart3}>
            View Analytics
          </Button>

          <Button variant="outline" fullWidth icon={Download}>
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}
