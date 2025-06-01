"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/authContext";
import Button from "../../../../components/common/Button";
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
} from "lucide-react";
import apiClient, { apiUtils } from "../../../../lib/api";

// Helper component for TikTok icon
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

const platforms = [
  { value: "instagram", label: "Instagram", icon: Users },
  { value: "youtube", label: "YouTube", icon: Users },
  { value: "twitter", label: "Twitter", icon: Users },
  { value: "tiktok", label: "TikTok", icon: TikTokIcon },
];

export default function CampaignRecommendationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const campaignId = params?.id;

  const [campaign, setCampaign] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("score");
  const [filterBy, setFilterBy] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
        { fresh: "true", limit: 50 }
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setRecommendations(result.data.recommendations);
        setSuccessMessage("AI recommendations refreshed successfully!");
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

  const getPlatformIcon = (platform) => {
    const platformObj = platforms.find((p) => p.value === platform);
    return platformObj ? platformObj.icon : Users;
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

  const sortedRecommendations = recommendations?.recommendations
    ? [...recommendations.recommendations].sort((a, b) => {
        switch (sortBy) {
          case "score":
            return (b.search_score || 0) - (a.search_score || 0);
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
          case "satisfaction":
            return (
              (b.creator_data.client_satisfaction_score || 0) -
              (a.creator_data.client_satisfaction_score || 0)
            );
          default:
            return 0;
        }
      })
    : [];

  const filteredRecommendations = filterBy
    ? sortedRecommendations.filter(
        (rec) =>
          rec.creator_data.niche
            ?.toLowerCase()
            .includes(filterBy.toLowerCase()) ||
          rec.creator_data.creator_name
            ?.toLowerCase()
            .includes(filterBy.toLowerCase())
      )
    : sortedRecommendations;

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI recommendations...</p>
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
                {campaign?.campaign_name && `For "${campaign.campaign_name}"`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefreshRecommendations}
              loading={isRefreshing}
            >
              Refresh
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

      {/* Recommendations Summary */}
      {recommendations && (
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-2xl font-bold text-primary-600">
                {recommendations.total_found}
              </p>
              <p className="text-sm text-gray-600">Total Found</p>
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
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {recommendations.recommendations?.length}
              </p>
              <p className="text-sm text-gray-600">Top Recommendations</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {selectedCreators.length}
              </p>
              <p className="text-sm text-gray-600">Selected</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Filter by name or niche..."
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
              <option value="score">Sort by Match Score</option>
              <option value="followers">Sort by Followers</option>
              <option value="engagement">Sort by Engagement</option>
              <option value="satisfaction">Sort by Satisfaction</option>
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
              Export
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

      {/* Creator Recommendations */}
      {filteredRecommendations.length === 0 ? (
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Recommendations Found
          </h3>
          <p className="text-gray-600 mb-6">
            Try refreshing the recommendations or adjusting your campaign
            criteria.
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {creator.creator_name}
                        </h3>
                        {creator.verification_status === "verified" && (
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                        )}
                        <span className="text-sm font-medium text-primary-600">
                          {(rec.search_score * 100).toFixed(0)}% match
                        </span>
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
                          icon={Eye}
                          onClick={() =>
                            window.open(`/creators/${creator.id}`, "_blank")
                          }
                        >
                          View
                        </Button>
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
                      <img
                        src={
                          creator.profile_image_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            creator.creator_name
                          )}&background=3B82F6&color=fff`
                        }
                        alt={creator.creator_name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
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
                      <span className="text-sm font-medium text-primary-600">
                        {(rec.search_score * 100).toFixed(0)}% match
                      </span>
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

                  {/* Rating & Action Buttons */}
                  <div className="flex items-center justify-between mb-4">
                    {creator.client_satisfaction_score && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm font-medium">
                          {creator.client_satisfaction_score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

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
                      icon={Eye}
                      onClick={() =>
                        window.open(`/creators/${creator.id}`, "_blank")
                      }
                      fullWidth
                    >
                      View
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
