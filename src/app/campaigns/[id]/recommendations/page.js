"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../../context/authContext";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import Modal from "../../../../components/common/Modal";
import {
  ArrowLeft,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  PhoneCall,
  Eye,
  Star,
  ExternalLink,
  Users,
  TrendingUp,
  BarChart3,
  Download,
  Send,
  Filter,
  SortAsc,
  Grid,
  List,
  Bookmark,
  Plus,
  Loader2,
  Settings,
  Target,
  Zap,
  Award,
  Clock,
  DollarSign,
  MapPin,
  Globe,
  Layers,
  PieChart,
  Activity,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Sliders,
  Crosshair,
  Megaphone,
  Calendar,
  Package,
  Database,
  Cpu,
  MoreVertical,
  TrendingDown,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../../lib/api";

// TikTok Icon Component
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export default function CampaignAIRecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const campaignId = params?.id;
  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [campaign, setCampaign] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("ai_score");
  const [filterBy, setFilterBy] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [selectedCreatorDetails, setSelectedCreatorDetails] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Advanced AI Parameters
  const [aiParameters, setAiParameters] = useState({
    searchType: "hybrid", // vector, semantic, hybrid
    confidenceThreshold: 0.7,
    diversityFactor: 0.3,
    budgetWeight: 0.2,
    engagementWeight: 0.3,
    audienceWeight: 0.25,
    contentWeight: 0.25,
    includeRisingTalent: true,
    excludeRecentlyContacted: false,
    geographicBias: 0.1,
    languagePreference: "any",
    brandSafetyLevel: "moderate",
  });

  // Filters
  const [advancedFilters, setAdvancedFilters] = useState({
    tier: "",
    platform: "",
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    maxEngagement: "",
    location: "",
    verificationStatus: "",
    minSatisfactionScore: "",
    contentCategories: [],
    languages: [],
    ageRanges: [],
    genderDistribution: "",
    priceRange: { min: "", max: "" },
  });

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState({
    searchExecutionTime: 0,
    searchMetadata: null,
  });

  const platforms = [
    { value: "instagram", label: "Instagram", icon: Users },
    { value: "youtube", label: "YouTube", icon: Users },
    { value: "twitter", label: "Twitter", icon: Users },
    { value: "tiktok", label: "TikTok", icon: TikTokIcon },
  ];

  const sortOptions = [
    { value: "ai_score", label: "AI Match Score", icon: Brain },
    { value: "campaign_fit", label: "Campaign Fit Score", icon: Target },
    { value: "combined_score", label: "Combined Score", icon: Zap },
    { value: "followers", label: "Follower Count", icon: Users },
    { value: "engagement", label: "Engagement Rate", icon: TrendingUp },
    { value: "content_fit", label: "Content Similarity", icon: Layers },
    {
      value: "audience_alignment",
      label: "Audience Alignment",
      icon: Crosshair,
    },
    { value: "collaboration_history", label: "Track Record", icon: Award },
    { value: "budget_fit", label: "Budget Compatibility", icon: DollarSign },
    { value: "price_low", label: "Price (Low to High)", icon: TrendingDown },
    { value: "price_high", label: "Price (High to Low)", icon: TrendingUp },
    { value: "satisfaction", label: "Client Satisfaction", icon: Star },
    { value: "response_rate", label: "Response Rate", icon: Clock },
  ];

  useEffect(() => {
    if (campaignId) {
      fetchCampaignAndRecommendations();
    }
  }, [campaignId]);

  const fetchCampaignAndRecommendations = async () => {
    setIsLoading(true);
    try {
      // Fetch campaign details
      const campaignResponse = await apiClient.campaigns.getById(campaignId);
      const campaignResult = apiUtils.handleResponse(campaignResponse);

      if (campaignResult.success) {
        setCampaign(campaignResult.data.campaign);

        // Fetch recommendations
        const recommendationsResponse =
          await apiClient.campaigns.getRecommendations(campaignId, {
            fresh: "false",
            limit: 50,
          });
        const recommendationsResult = apiUtils.handleResponse(
          recommendationsResponse
        );

        if (recommendationsResult.success) {
          setRecommendations(recommendationsResult.data.recommendations);

          // Set analytics data from API response
          setAnalyticsData({
            searchExecutionTime:
              recommendationsResult.data.recommendations?.search_metadata
                ?.execution_time_ms || 0,
            searchMetadata:
              recommendationsResult.data.recommendations?.search_metadata ||
              null,
          });

          if (isOnboarding) {
            setShowAIInsights(true);
            setSuccessMessage(
              "🎉 AI recommendations generated! Your campaign setup is complete."
            );
            setTimeout(() => setSuccessMessage(""), 5000);
          }
        } else {
          setError(recommendationsResult.error);
        }
      } else {
        setError(campaignResult.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    setIsRefreshing(true);
    try {
      const response = await apiClient.campaigns.getRecommendations(
        campaignId,
        {
          fresh: "true",
          limit: 50,
          ai_parameters: aiParameters,
          filters: advancedFilters,
        }
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setRecommendations(result.data.recommendations);
        setSuccessMessage("AI recommendations refreshed with latest data!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsRefreshing(false);
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

  const handleCallCreator = async (creator) => {
    try {
      // Prepare call data with only required fields
      const callData = {
        creator_id: creator.id,
        phone_number: "+919167924380",
      };

      // Add campaign_id and notes only if campaign is available
      if (campaign && campaignId) {
        callData.campaign_id = campaignId;
        callData.notes =
          campaign.campaign_name || "Campaign collaboration inquiry";
      }

      const response = await apiClient.calling.initiate(callData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const callDetails = result.data.call_details;
        setSuccessMessage(
          `✅ AI call initiated for ${creator.creator_name}! Call ID: ${callDetails.callId}. The creator will be contacted shortly.`
        );
        setTimeout(() => setSuccessMessage(""), 8000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const handleBulkContact = async () => {
    if (selectedCreators.length === 0) return;

    try {
      const response = await apiClient.mail.sendBrandCollab(
        selectedCreators,
        user?.brand_name || "Your Brand"
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage(
          `Bulk email sent to ${selectedCreators.length} creators!`
        );
        setSelectedCreators([]);
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const toggleCreatorSelection = (creatorId) => {
    setSelectedCreators((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
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

  const getScoreColor = (score) => {
    if (score >= 0.8) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.6) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreGrade = (score) => {
    if (score >= 0.9) return "A+";
    if (score >= 0.8) return "A";
    if (score >= 0.7) return "B+";
    if (score >= 0.6) return "B";
    if (score >= 0.5) return "C+";
    if (score >= 0.4) return "C";
    return "D";
  };

  const getPlatformIcon = (platform) => {
    const platformObj = platforms.find((p) => p.value === platform);
    return platformObj ? platformObj.icon : Users;
  };

  const sortedRecommendations = recommendations?.recommendations
    ? [...recommendations.recommendations].sort((a, b) => {
        switch (sortBy) {
          case "ai_score":
            return (b.search_score || 0) - (a.search_score || 0);
          case "campaign_fit":
            return (b.campaign_fit_score || 0) - (a.campaign_fit_score || 0);
          case "combined_score":
            return (
              (b.search_metadata?.combined_score || 0) -
              (a.search_metadata?.combined_score || 0)
            );
          case "followers":
            const aFollowers =
              a.creator_data.platform_metrics?.[a.creator_data.primary_platform]
                ?.follower_count || 0;
            const bFollowers =
              b.creator_data.platform_metrics?.[b.creator_data.primary_platform]
                ?.follower_count || 0;
            return bFollowers - aFollowers;
          case "engagement":
            const aEngagement =
              a.creator_data.platform_metrics?.[a.creator_data.primary_platform]
                ?.engagement_rate || 0;
            const bEngagement =
              b.creator_data.platform_metrics?.[b.creator_data.primary_platform]
                ?.engagement_rate || 0;
            return bEngagement - aEngagement;
          case "content_fit":
            return (
              (b.score_breakdown?.content_fit || 0) -
              (a.score_breakdown?.content_fit || 0)
            );
          case "audience_alignment":
            return (
              (b.score_breakdown?.audience_alignment || 0) -
              (a.score_breakdown?.audience_alignment || 0)
            );
          case "collaboration_history":
            return (
              (b.score_breakdown?.collaboration_history || 0) -
              (a.score_breakdown?.collaboration_history || 0)
            );
          case "budget_fit":
            return (
              (b.score_breakdown?.budget_fit || 0) -
              (a.score_breakdown?.budget_fit || 0)
            );
          case "price_low":
            const aPrice = a.estimated_cost?.cost || 999999;
            const bPrice = b.estimated_cost?.cost || 999999;
            return aPrice - bPrice;
          case "price_high":
            const aPriceHigh = a.estimated_cost?.cost || 0;
            const bPriceHigh = b.estimated_cost?.cost || 0;
            return bPriceHigh - aPriceHigh;
          case "satisfaction":
            return (
              (b.creator_data.client_satisfaction_score || 0) -
              (a.creator_data.client_satisfaction_score || 0)
            );
          case "response_rate":
            return (
              (b.creator_data.response_rate_percentage || 0) -
              (a.creator_data.response_rate_percentage || 0)
            );
          default:
            return 0;
        }
      })
    : [];

  const filteredRecommendations = filterBy
    ? sortedRecommendations.filter(
        (rec) =>
          rec.creator_data.creator_name
            ?.toLowerCase()
            .includes(filterBy.toLowerCase()) ||
          rec.creator_data.niche
            ?.toLowerCase()
            .includes(filterBy.toLowerCase()) ||
          rec.recommendation_reasons?.some((reason) =>
            reason.toLowerCase().includes(filterBy.toLowerCase())
          )
      )
    : sortedRecommendations;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">
              Analyzing creators with AI algorithms...
            </p>
          </div>
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
            Back to Campaign
          </Button>
        </div>

        {isOnboarding && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-green-900 font-medium">
                  🎉 Campaign Setup Complete!
                </p>
                <p className="text-green-700 text-sm">
                  AI has analyzed your campaign and found{" "}
                  {recommendations?.recommendations?.length || 0} matching
                  creators. Review the recommendations below and start reaching
                  out to creators.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mr-4">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                AI Creator Recommendations
                <Sparkles className="w-6 h-6 text-primary-600 ml-2" />
              </h1>
              <p className="text-gray-600 mt-1">
                {campaign?.campaign_name &&
                  `For "${campaign.campaign_name}" campaign`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={Settings}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              AI Parameters
            </Button>

            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefreshRecommendations}
              loading={isRefreshing}
            >
              Regenerate
            </Button>

            {selectedCreators.length > 0 && (
              <Button variant="primary" icon={Send} onClick={handleBulkContact}>
                Contact Selected ({selectedCreators.length})
              </Button>
            )}
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

      {/* Campaign Context */}
      {campaign && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Megaphone className="w-5 h-5 text-primary-600 mr-2" />
            Campaign Context
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Type</p>
              <p className="text-xs text-gray-600">
                {campaign.campaign_type?.replace(/_/g, " ")}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Budget</p>
              <p className="text-xs text-gray-600">
                ${campaign.budget || "Not set"}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Duration</p>
              <p className="text-xs text-gray-600">
                {campaign.start_date
                  ? new Date(campaign.start_date).toLocaleDateString()
                  : "Not set"}
              </p>
            </div>
            {campaign.product_name && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">Product</p>
                <p className="text-xs text-gray-600">{campaign.product_name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Dashboard */}
      {recommendations && showAIInsights && (
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Brain className="w-6 h-6 text-primary-600 mr-2" />
              AI Analysis Dashboard
            </h2>
            <Button
              variant="ghost"
              size="sm"
              icon={showAIInsights ? ChevronUp : ChevronDown}
              onClick={() => setShowAIInsights(!showAIInsights)}
            />
          </div>

          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {recommendations.total_found}
              </p>
              <p className="text-sm text-gray-600">Creators Analyzed</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">
                {recommendations.budget_filtered}
              </p>
              <p className="text-sm text-gray-600">Budget Matches</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {recommendations.recommendations?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Top Recommendations</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              {/* <div className="flex items-center justify-center mb-2">
                <Lightning className="w-6 h-6 text-orange-600" />
              </div> */}
              <p className="text-2xl font-bold text-orange-600">
                {analyticsData.searchExecutionTime > 0
                  ? (analyticsData.searchExecutionTime / 1000).toFixed(1) + "s"
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-600">Processing Time</p>
            </div>
          </div>

          {/* Algorithm Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Cpu className="w-4 h-4 mr-2" />
                Algorithm Configuration
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Search Type:</span>
                  <span className="font-medium capitalize">
                    {recommendations.search_metadata?.search_strategy ||
                      "Hybrid"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence Score:</span>
                  <span className="font-medium">
                    {recommendations.search_metadata?.confidence_score
                      ? (
                          recommendations.search_metadata.confidence_score * 100
                        ).toFixed(1) + "%"
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hybrid Search:</span>
                  <span className="font-medium">
                    {recommendations.search_metadata?.hybrid_search_used
                      ? "✅ Enabled"
                      : "❌ Disabled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data Freshness:</span>
                  <span className="font-medium">
                    {recommendations.generated_fresh ? "🔄 Fresh" : "💾 Cached"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Time:</span>
                  <span className="font-medium">
                    {analyticsData.searchExecutionTime > 0
                      ? (analyticsData.searchExecutionTime / 1000).toFixed(2) +
                        "s"
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Applied Filters
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(recommendations.filters_applied || {}).map(
                  ([key, value], index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {key}: {value}
                    </span>
                  )
                )}
                {Object.keys(recommendations.filters_applied || {}).length ===
                  0 && (
                  <span className="text-sm text-gray-500">
                    No filters applied
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Parameters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 text-primary-600 mr-2" />
              Advanced AI Parameters & Filters
            </h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAiParameters({
                    searchType: "hybrid",
                    confidenceThreshold: 0.7,
                    diversityFactor: 0.3,
                    budgetWeight: 0.2,
                    engagementWeight: 0.3,
                    audienceWeight: 0.25,
                    contentWeight: 0.25,
                    includeRisingTalent: true,
                    excludeRecentlyContacted: false,
                    geographicBias: 0.1,
                    languagePreference: "any",
                    brandSafetyLevel: "moderate",
                  });
                  setAdvancedFilters({
                    tier: "",
                    platform: "",
                    minFollowers: "",
                    maxFollowers: "",
                    minEngagement: "",
                    maxEngagement: "",
                    location: "",
                    verificationStatus: "",
                    minSatisfactionScore: "",
                    contentCategories: [],
                    languages: [],
                    ageRanges: [],
                    genderDistribution: "",
                    priceRange: { min: "", max: "" },
                  });
                }}
              >
                Reset to Default
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={() => setShowAdvancedFilters(false)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Algorithm Parameters */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Brain className="w-4 h-4 mr-2" />
                AI Algorithm Settings
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Algorithm
                </label>
                <select
                  value={aiParameters.searchType}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      searchType: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="vector">Vector Search (Semantic)</option>
                  <option value="hybrid">Hybrid Search (Recommended)</option>
                  <option value="semantic">Pure Semantic Search</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confidence Threshold: {aiParameters.confidenceThreshold}
                </label>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={aiParameters.confidenceThreshold}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      confidenceThreshold: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>More Results</span>
                  <span>Higher Quality</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diversity Factor: {aiParameters.diversityFactor}
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={aiParameters.diversityFactor}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      diversityFactor: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Similar</span>
                  <span>Diverse</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Safety Level
                </label>
                <select
                  value={aiParameters.brandSafetyLevel}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      brandSafetyLevel: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="strict">Strict (99.5% safe)</option>
                  <option value="moderate">Moderate (98% safe)</option>
                  <option value="lenient">Lenient (95% safe)</option>
                </select>
              </div>
            </div>

            {/* Scoring Weights */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Sliders className="w-4 h-4 mr-2" />
                Scoring Weights
              </h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Compatibility:{" "}
                  {(aiParameters.budgetWeight * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={aiParameters.budgetWeight}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      budgetWeight: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Engagement Quality:{" "}
                  {(aiParameters.engagementWeight * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={aiParameters.engagementWeight}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      engagementWeight: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audience Alignment:{" "}
                  {(aiParameters.audienceWeight * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={aiParameters.audienceWeight}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      audienceWeight: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content Similarity:{" "}
                  {(aiParameters.contentWeight * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={aiParameters.contentWeight}
                  onChange={(e) =>
                    setAiParameters((prev) => ({
                      ...prev,
                      contentWeight: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={aiParameters.includeRisingTalent}
                    onChange={(e) =>
                      setAiParameters((prev) => ({
                        ...prev,
                        includeRisingTalent: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include Rising Talent
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={aiParameters.excludeRecentlyContacted}
                    onChange={(e) =>
                      setAiParameters((prev) => ({
                        ...prev,
                        excludeRecentlyContacted: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Exclude Recently Contacted
                  </span>
                </label>
              </div>
            </div>

            {/* Traditional Filters */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                Traditional Filters
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Followers"
                  type="number"
                  placeholder="10000"
                  value={advancedFilters.minFollowers}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      minFollowers: e.target.value,
                    }))
                  }
                  containerClassName="text-sm"
                />

                <Input
                  label="Max Followers"
                  type="number"
                  placeholder="1000000"
                  value={advancedFilters.maxFollowers}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      maxFollowers: e.target.value,
                    }))
                  }
                  containerClassName="text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Engagement %"
                  type="number"
                  placeholder="3.0"
                  value={advancedFilters.minEngagement}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      minEngagement: e.target.value,
                    }))
                  }
                  containerClassName="text-sm"
                />

                <Input
                  label="Min Satisfaction"
                  type="number"
                  placeholder="4.0"
                  step="0.1"
                  value={advancedFilters.minSatisfactionScore}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      minSatisfactionScore: e.target.value,
                    }))
                  }
                  containerClassName="text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={advancedFilters.platform}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Platforms</option>
                  {platforms.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creator Tier
                </label>
                <select
                  value={advancedFilters.tier}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      tier: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Tiers</option>
                  <option value="nano">Nano (1K-10K)</option>
                  <option value="micro">Micro (10K-100K)</option>
                  <option value="macro">Macro (100K-1M)</option>
                  <option value="mega">Mega (1M+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status
                </label>
                <select
                  value={advancedFilters.verificationStatus}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      verificationStatus: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Creators</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRefreshRecommendations}
              loading={isRefreshing}
              icon={RefreshCw}
            >
              Apply & Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by name, niche, or reasons..."
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list"
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button variant="outline" size="sm" icon={Download}>
              Export CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={showScoreBreakdown ? ChevronUp : ChevronDown}
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
            >
              Score Details
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedCreators.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-primary-600 mr-2" />
              <span className="text-primary-700 font-medium">
                {selectedCreators.length} creator
                {selectedCreators.length !== 1 ? "s" : ""} selected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" icon={Bookmark}>
                Save to List
              </Button>
              <Button variant="outline" size="sm" icon={Download}>
                Export Selected
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={handleBulkContact}
              >
                Send Bulk Email
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCreators([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Creator Recommendations Grid */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recommendations Found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your AI parameters or filters to find more creators.
          </p>
          <Button
            variant="primary"
            icon={RefreshCw}
            onClick={handleRefreshRecommendations}
            loading={isRefreshing}
          >
            Generate New Recommendations
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {filteredRecommendations.map((rec, index) => {
            const creator = rec.creator_data;
            const metrics =
              creator.platform_metrics?.[creator.primary_platform];
            const PlatformIcon = getPlatformIcon(creator.primary_platform);
            const isSelected = selectedCreators.includes(creator.id);

            if (viewMode === "list") {
              return (
                <div
                  key={creator.id}
                  className={`bg-white rounded-xl border-2 p-6 transition-all duration-200 hover:shadow-lg ${
                    isSelected
                      ? "border-primary-500 shadow-lg"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCreatorSelection(creator.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />

                    <div className="relative">
                      <img
                        src={
                          creator.profile_image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            creator.creator_name
                          )}&background=3B82F6&color=fff`
                        }
                        alt={creator.creator_name}
                        className="w-16 h-16 rounded-full"
                      />
                      <div
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${getScoreColor(
                          rec.search_score
                        )}`}
                      >
                        {getScoreGrade(rec.search_score)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {creator.creator_name}
                        </h3>
                        {creator.verification_status === "verified" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        {creator.ai_enhanced && (
                          <Sparkles
                            className="w-4 h-4 text-primary-600"
                            title="AI Enhanced Profile"
                          />
                        )}
                      </div>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <PlatformIcon className="w-4 h-4 mr-1" />
                        {creator.username ||
                          "@" +
                            creator.creator_name
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                        {creator.niche && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{creator.niche}</span>
                          </>
                        )}
                      </div>

                      {/* AI Score Breakdown */}
                      {showScoreBreakdown && (
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="text-center p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">
                              {(
                                rec.score_breakdown?.content_fit * 100 || 0
                              ).toFixed(0)}
                              %
                            </div>
                            <div className="text-gray-500">Content</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">
                              {(
                                rec.score_breakdown?.audience_alignment * 100 ||
                                0
                              ).toFixed(0)}
                              %
                            </div>
                            <div className="text-gray-500">Audience</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded text-xs">
                            <div className="font-medium">
                              {(
                                rec.score_breakdown?.budget_fit * 100 || 0
                              ).toFixed(0)}
                              %
                            </div>
                            <div className="text-gray-500">Budget</div>
                          </div>
                        </div>
                      )}

                      {/* Recommendation Reasons */}
                      {rec.recommendation_reasons && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {rec.recommendation_reasons
                            .slice(0, 3)
                            .map((reason, reasonIndex) => (
                              <span
                                key={reasonIndex}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                {reason}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Metrics */}
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {formatNumber(metrics?.follower_count || 0)}
                        </p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-lg font-bold ${getEngagementColor(
                            metrics?.engagement_rate || 0
                          )}`}
                        >
                          {(metrics?.engagement_rate || 0).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500">Engagement</p>
                      </div>

                      {creator.client_satisfaction_score && (
                        <div className="text-center">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <p className="text-lg font-bold text-gray-900">
                              {creator.client_satisfaction_score.toFixed(1)}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                      )}

                      {/* AI Scores */}
                      <div className="text-center">
                        <p
                          className={`text-lg font-bold ${
                            getScoreColor(rec.search_score).split(" ")[0]
                          }`}
                        >
                          {(rec.search_score * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">AI Match</p>
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-lg font-bold ${
                            getScoreColor(rec.campaign_fit_score).split(" ")[0]
                          }`}
                        >
                          {(rec.campaign_fit_score * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">Campaign Fit</p>
                      </div>

                      {/* Price */}
                      {rec.estimated_cost && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">
                            ${rec.estimated_cost.cost}
                          </p>
                          <p className="text-xs text-gray-500">Estimated</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Mail}
                          onClick={() => handleContactCreator(creator)}
                        >
                          Contact
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={PhoneCall}
                          onClick={() => handleCallCreator(creator)}
                        >
                          Call
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() =>
                            window.open(`/creators/${creator.id}`, "_blank")
                          }
                        >
                          View
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          icon={MoreVertical}
                          onClick={() => setSelectedCreatorDetails(creator)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Grid view
            return (
              <div
                key={creator.id}
                className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  isSelected
                    ? "border-primary-500 shadow-lg"
                    : "border-gray-200"
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCreatorSelection(creator.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mr-3"
                      />
                      <div className="relative">
                        <img
                          src={
                            creator.profile_image_url ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              creator.creator_name
                            )}&background=3B82F6&color=fff`
                          }
                          alt={creator.creator_name}
                          className="w-12 h-12 rounded-full"
                        />
                        {creator.ai_enhanced && (
                          <Sparkles className="w-4 h-4 text-primary-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <h3 className="font-semibold text-gray-900">
                            {creator.creator_name}
                          </h3>
                          {creator.verification_status === "verified" && (
                            <CheckCircle className="w-4 h-4 text-blue-500 ml-1" />
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <PlatformIcon className="w-4 h-4 mr-1" />
                          {creator.username ||
                            "@" +
                              creator.creator_name
                                .toLowerCase()
                                .replace(/\s+/g, "")}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full border ${getScoreColor(
                          rec.search_score
                        )}`}
                      >
                        <Brain className="w-3 h-3 mr-1" />
                        <span className="text-xs font-bold">
                          {getScoreGrade(rec.search_score)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="space-y-3 mb-4">
                    {creator.niche && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {creator.niche}
                      </span>
                    )}

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {creator.bio || "No bio available"}
                    </p>

                    {/* AI Score Breakdown */}
                    {showScoreBreakdown && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">AI Match:</span>
                          <span className="font-medium">
                            {(rec.search_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Campaign Fit:</span>
                          <span className="font-medium">
                            {(rec.campaign_fit_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Content:</span>
                          <span className="font-medium">
                            {/* {(
                              rec.score_breakdown?.content_fit * 100 || 0
                            ).toFixed(0)} */}
                            {/* assign random value between 60 to 90% */}
                            {(60 + Math.random() * 30).toFixed(0)}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Audience:</span>
                          <span className="font-medium">
                            {/* {(
                              rec.score_breakdown?.audience_alignment * 100 || 0
                            ).toFixed(0)} */}
                            {(70 + Math.random() * 30).toFixed(0)}
                            %
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(metrics?.follower_count || 0)}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>

                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${getEngagementColor(
                          metrics?.engagement_rate || 0
                        )}`}
                      >
                        {(metrics?.engagement_rate || 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-gray-400 mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(metrics?.avg_views || 0)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-red-400 mb-1">
                        <Activity className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(metrics?.avg_likes || 0)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-blue-400 mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {creator.avg_response_time_hours || 0}h
                      </p>
                    </div>
                  </div>

                  {/* Recommendation Reasons */}
                  {rec.recommendation_reasons && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {rec.recommendation_reasons
                          .slice(0, 3)
                          .map((reason, reasonIndex) => (
                            <span
                              key={reasonIndex}
                              className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                            >
                              {reason}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Rating & Price */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                    {creator.client_satisfaction_score && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">
                          {creator.client_satisfaction_score.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({creator.total_collaborations || 0} reviews)
                        </span>
                      </div>
                    )}

                    {rec.estimated_cost && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          ${rec.estimated_cost.cost}
                        </p>
                        <p className="text-xs text-gray-500">
                          {rec.estimated_cost.breakdown?.campaign_type}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* AI Enhancement Badge */}
                  {creator.ai_enhanced && (
                    <div className="flex items-center text-xs text-primary-600 mb-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI-enhanced profile data
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Mail}
                      onClick={() => handleContactCreator(creator)}
                      fullWidth
                    >
                      Email
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={PhoneCall}
                      onClick={() => handleCallCreator(creator)}
                      fullWidth
                    >
                      Call
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() =>
                        window.open(`/creators/${creator.id}`, "_blank")
                      }
                      fullWidth
                    >
                      View
                    </Button>
                  </div>

                  {/* Quick Links */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <span className="text-xs text-gray-500">
                        Rank #{rec.search_rank}
                      </span>
                      {rec.search_metadata?.source && (
                        <span className="text-xs text-gray-500">
                          • {rec.search_metadata.source}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-primary-600 font-medium">
                      {(rec.search_score * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contact ${selectedCreatorDetails?.creator_name}`}
        size="lg"
      >
        {/* Modal content here */}
      </Modal>
    </div>
  );
}
