"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/authContext";
import Button from "../../../components/common/Button";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  Star,
  MapPin,
  Instagram,
  Youtube,
  Twitter,
  Eye,
  Heart,
  MessageCircle,
  Share,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Award,
  TrendingUp,
  Globe,
  Bookmark,
  Send,
  PhoneCall,
  BarChart3,
  Clock,
  Languages,
  Flag,
  Shield,
  Sparkles,
} from "lucide-react";
import apiClient, { apiUtils } from "../../../lib/api";

// Helper component for TikTok icon since it's not in lucide-react
const TikTokIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const creatorId = params?.id;

  const [creator, setCreator] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (creatorId) {
      fetchCreator();
    }
  }, [creatorId]);

  const fetchCreator = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching creator with ID:", creatorId);
      const response = await apiClient.creators.getById(creatorId);
      console.log("API Response:", response);

      const result = apiUtils.handleResponse(response);
      console.log("Processed result:", result);

      if (result.success && result.data) {
        // Handle different possible data structures
        const creatorData = result.data.creator || result.data;
        console.log("Creator data:", creatorData);

        if (creatorData && creatorData.id) {
          setCreator(creatorData);
        } else {
          console.error("No valid creator data found:", result.data);
          setError("Creator data is invalid or incomplete");
        }
      } else {
        console.error("API call failed:", result.error);
        setError(result.error || "Failed to load creator");
      }
    } catch (error) {
      console.error("Error fetching creator:", error);
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactCreator = () => {
    if (!creator) return;

    setContactForm({
      subject: `Collaboration Opportunity from ${
        user?.brand_name || "Your Brand"
      }`,
      message: `Hi ${creator.creator_name},

I hope this message finds you well! I'm reaching out from ${
        user?.brand_name || "Your Brand"
      } regarding a potential collaboration opportunity.

We believe your content and audience would be a perfect fit for our brand, and we'd love to discuss how we can work together to create amazing content.

I'd be happy to provide more details about the collaboration and answer any questions you might have.

Looking forward to hearing from you!

Best regards,
${user?.first_name || "Brand Representative"}
${user?.brand_name || "Your Brand"}`,
    });
    setShowContactModal(true);
  };

  const handleCallCreator = async () => {
    try {
      // Prepare call data with only required fields
      const callData = {
        creator_id: creator.id,
        phone_number: "+919167924380",
      };

      // Get campaign context from URL if available
      const urlParams = new URLSearchParams(window.location.search);
      const contextCampaignId = urlParams.get("campaign_id");

      // Add campaign_id and notes only if available
      if (contextCampaignId) {
        callData.campaign_id = contextCampaignId;
        callData.notes = `Campaign collaboration inquiry for campaign ${contextCampaignId}`;
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

  const handleSendEmail = async () => {
    if (!creator) return;

    try {
      const response = await apiClient.mail.sendBrandCollab(
        [creator.id],
        user?.brand_name || "Your Brand"
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setShowContactModal(false);
        setSuccessMessage("Email sent successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const getCreatorTier = (followers) => {
    if (!followers || followers < 10000) return "nano";
    if (followers < 100000) return "micro";
    if (followers < 1000000) return "macro";
    return "mega";
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case "nano":
        return "bg-blue-100 text-blue-700";
      case "micro":
        return "bg-green-100 text-green-700";
      case "macro":
        return "bg-purple-100 text-purple-700";
      case "mega":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case "instagram":
        return Instagram;
      case "youtube":
        return Youtube;
      case "twitter":
        return Twitter;
      case "tiktok":
        return TikTokIcon;
      default:
        return Users;
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatCurrency = (amount, currency = "USD") => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getEngagementColor = (rate) => {
    if (!rate) return "text-gray-600";
    if (rate >= 6) return "text-green-600";
    if (rate >= 3) return "text-blue-600";
    if (rate >= 1) return "text-yellow-600";
    return "text-red-600";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creator profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !creator) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to Load Creator
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <Button variant="primary" onClick={() => router.push("/creators")}>
              Back to Creator Discovery
            </Button>
            <Button variant="outline" onClick={fetchCreator}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No creator found
  if (!creator) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Creator Not Found
          </h3>
          <p className="text-gray-600 mb-6">
            The creator you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => router.push("/creators")}>
            Back to Creator Discovery
          </Button>
        </div>
      </div>
    );
  }

  const PlatformIcon = getPlatformIcon(creator.primary_platform);
  const primaryMetrics =
    creator.platform_metrics?.[creator.primary_platform] || {};
  const tier = getCreatorTier(primaryMetrics.follower_count);

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
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Creator Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start space-x-6">
              <img
                src={
                  creator.profile_image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    creator.creator_name || "Creator"
                  )}&background=3B82F6&color=fff`
                }
                alt={creator.creator_name || "Creator"}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    creator.creator_name || "Creator"
                  )}&background=3B82F6&color=fff`;
                }}
              />

              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 mr-3">
                    {creator.creator_name || "Unknown Creator"}
                  </h1>
                  {creator.verification_status === "verified" && (
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  )}
                </div>

                <div className="flex items-center text-gray-600 mb-3">
                  <PlatformIcon className="w-5 h-5 mr-2" />
                  <span className="mr-4">
                    {creator.username ||
                      "@" +
                        (creator.creator_name || "creator")
                          .toLowerCase()
                          .replace(/\s+/g, "")}
                  </span>

                  {creator.location_city && (
                    <>
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>
                        {creator.location_city}
                        {creator.location_country &&
                          `, ${creator.location_country}`}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3 mb-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${getTierColor(
                      tier
                    )}`}
                  >
                    {tier.charAt(0).toUpperCase() + tier.slice(1)} Influencer
                  </span>

                  {creator.niche && (
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-700 rounded-full">
                      {creator.niche}
                    </span>
                  )}

                  {creator.ai_enhanced && (
                    <span className="px-3 py-1 text-sm font-medium bg-primary-100 text-primary-700 rounded-full flex items-center">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </span>
                  )}
                </div>

                <p className="text-gray-600 leading-relaxed">
                  {creator.bio || "No bio available"}
                </p>

                {/* Languages */}
                {creator.languages && creator.languages.length > 0 && (
                  <div className="mt-3 flex items-center">
                    <Languages className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">
                      {creator.languages.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex space-x-4">
              <Button
                variant="primary"
                icon={Mail}
                onClick={handleContactCreator}
              >
                Contact Creator
              </Button>

              <Button
                variant="outline"
                icon={PhoneCall}
                onClick={handleCallCreator}
              >
                AI Call
              </Button>

              <Button variant="ghost" icon={Bookmark}>
                Save
              </Button>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Platform Performance
            </h2>

            <div className="space-y-6">
              {Object.entries(creator.platform_metrics || {}).map(
                ([platform, metrics]) => {
                  const PlatIcon = getPlatformIcon(platform);

                  return (
                    <div
                      key={platform}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <PlatIcon className="w-6 h-6 text-gray-600 mr-3" />
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {platform}
                          </h3>
                          {platform === creator.primary_platform && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(metrics.follower_count)}
                          </p>
                          <p className="text-sm text-gray-600">Followers</p>
                        </div>

                        <div className="text-center">
                          <p
                            className={`text-2xl font-bold ${getEngagementColor(
                              metrics.engagement_rate
                            )}`}
                          >
                            {metrics.engagement_rate?.toFixed(1) || "0"}%
                          </p>
                          <p className="text-sm text-gray-600">Engagement</p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatNumber(metrics.avg_views)}
                          </p>
                          <p className="text-sm text-gray-600">Avg Views</p>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">
                            {metrics.post_count || 0}
                          </p>
                          <p className="text-sm text-gray-600">Posts</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="flex items-center justify-center text-red-400 mb-1">
                            <Heart className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-medium">
                            {formatNumber(metrics.avg_likes)}
                          </p>
                          <p className="text-xs text-gray-500">Avg Likes</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-center text-blue-400 mb-1">
                            <MessageCircle className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-medium">
                            {formatNumber(metrics.avg_comments)}
                          </p>
                          <p className="text-xs text-gray-500">Avg Comments</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-center text-green-400 mb-1">
                            <Share className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-medium">
                            {formatNumber(metrics.avg_shares)}
                          </p>
                          <p className="text-xs text-gray-500">Avg Shares</p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Content Categories */}
          {creator.content_categories &&
            creator.content_categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Content Categories
                </h2>
                <div className="flex flex-wrap gap-2">
                  {creator.content_categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {category.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Content Examples */}
          {creator.content_examples && creator.content_examples.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Content Examples
              </h2>
              <div className="space-y-3">
                {creator.content_examples.slice(0, 5).map((example, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 text-sm">{example}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Creator Stats
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Active Since</span>
                </div>
                <span className="font-medium text-gray-900">
                  {creator.account_created_date
                    ? new Date(creator.account_created_date).getFullYear()
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Collaborations</span>
                </div>
                <span className="font-medium text-gray-900">
                  {creator.total_collaborations || 0}
                </span>
              </div>

              {creator.client_satisfaction_score && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Star className="w-4 h-4 text-yellow-600" />
                    </div>
                    <span className="text-sm text-gray-600">Satisfaction</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium text-gray-900">
                      {creator.client_satisfaction_score.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Response Time</span>
                </div>
                <span className="font-medium text-gray-900">
                  {creator.avg_response_time_hours
                    ? `${creator.avg_response_time_hours}h`
                    : "N/A"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-sm text-gray-600">Response Rate</span>
                </div>
                <span className="font-medium text-gray-900">
                  {creator.response_rate_percentage
                    ? `${creator.response_rate_percentage}%`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          {creator.pricing && Object.keys(creator.pricing).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing
              </h3>

              {Object.entries(creator.pricing).map(([platform, pricing]) => {
                const PlatIcon = getPlatformIcon(platform);

                return (
                  <div key={platform} className="mb-4 last:mb-0">
                    <div className="flex items-center mb-3">
                      <PlatIcon className="w-4 h-4 text-gray-600 mr-2" />
                      <h4 className="font-medium text-gray-900 capitalize">
                        {platform}
                      </h4>
                    </div>

                    <div className="space-y-2 text-sm">
                      {pricing.sponsored_post && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sponsored Post</span>
                          <span className="font-medium">
                            {formatCurrency(
                              pricing.sponsored_post,
                              pricing.currency || "USD"
                            )}
                          </span>
                        </div>
                      )}

                      {pricing.story_mention && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Story Mention</span>
                          <span className="font-medium">
                            {formatCurrency(
                              pricing.story_mention,
                              pricing.currency || "USD"
                            )}
                          </span>
                        </div>
                      )}

                      {pricing.video_integration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Video Integration
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              pricing.video_integration,
                              pricing.currency || "USD"
                            )}
                          </span>
                        </div>
                      )}

                      {pricing.brand_ambassadorship_monthly && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Monthly Partnership
                          </span>
                          <span className="font-medium">
                            {formatCurrency(
                              pricing.brand_ambassadorship_monthly,
                              pricing.currency || "USD"
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Contact Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>

            <div className="space-y-3">
              {creator.business_email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <a
                    href={`mailto:${creator.business_email}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    {creator.business_email}
                  </a>
                </div>
              )}

              {creator.email && creator.email !== creator.business_email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <a
                    href={`mailto:${creator.email}`}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    {creator.email}
                  </a>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  All contact attempts are logged and tracked for your
                  protection.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                icon={Mail}
                onClick={handleContactCreator}
              >
                Send Message
              </Button>

              <Button
                variant="outline"
                fullWidth
                icon={PhoneCall}
                onClick={handleCallCreator}
              >
                Schedule AI Call
              </Button>

              <Button variant="outline" fullWidth icon={BarChart3}>
                Request Media Kit
              </Button>

              <Button variant="ghost" fullWidth icon={Bookmark}>
                Add to Favorites
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contact ${creator.creator_name}`}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendEmail} icon={Send}>
              Send Message
            </Button>
          </div>
        }
      >
        {creator && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
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
              <div>
                <h3 className="font-semibold text-gray-900">
                  {creator.creator_name}
                </h3>
                <p className="text-sm text-gray-500">{creator.niche}</p>
              </div>
            </div>

            <Input
              label="Subject"
              value={contactForm.subject}
              onChange={(e) =>
                setContactForm((prev) => ({ ...prev, subject: e.target.value }))
              }
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={8}
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Mention specific content from their
                profile and be clear about your collaboration goals to improve
                response rates.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
