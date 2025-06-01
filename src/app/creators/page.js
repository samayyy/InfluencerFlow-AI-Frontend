"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import { useSearchParams } from "next/navigation";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Star,
  MapPin,
  Instagram,
  Youtube,
  Twitter,
 
  Eye,
  Heart,
  MessageCircle,
  Share,
  Mail,
  Phone,
  Bookmark,
  MoreVertical,
  Zap,
  Target,
  TrendingUp,
  Brain,
  Sliders,
  Download,
  Send,
  PhoneCall,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  Plus,
  Lightbulb,
  BarChart3,
  Globe,
  Award,
  Clock,
  DollarSign,
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function EnhancedCreatorSearchPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Get product context if coming from product page
  const contextProductId = searchParams?.get("product");

  const [filters, setFilters] = useState({
    niche: "",
    tier: "",
    platform: "",
    min_followers: "",
    max_followers: "",
    min_engagement: "",
    max_engagement: "",
    location_country: "",
    location_city: "",
    verification_status: "",
    audience_age_primary: "",
    audience_gender_primary: "",
    min_total_collaborations: "",
    min_satisfaction_score: "",
    languages: "",
    content_categories: "",
  });

  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Contact form state
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    campaign_id: "",
  });

  const niches = [
    "Fashion & Beauty",
    "Technology",
    "Gaming",
    "Fitness & Health",
    "Food & Cooking",
    "Travel",
    "Lifestyle",
    "Business",
    "Education",
    "Entertainment",
    "Sports",
    "Music",
    "Art & Design",
    "Automotive",
    "Finance",
    "Parenting",
    "DIY & Crafts",
    "Photography",
    "Comedy",
    "News & Politics",
  ];

  const tiers = [
    { value: "nano", label: "Nano (1K-10K followers)", min: 1000, max: 10000 },
    {
      value: "micro",
      label: "Micro (10K-100K followers)",
      min: 10000,
      max: 100000,
    },
    {
      value: "macro",
      label: "Macro (100K-1M followers)",
      min: 100000,
      max: 1000000,
    },
    { value: "mega", label: "Mega (1M+ followers)", min: 1000000, max: null },
  ];

  const platforms = [
    { value: "instagram", label: "Instagram", icon: Instagram },
    { value: "youtube", label: "YouTube", icon: Youtube },
    { value: "twitter", label: "Twitter", icon: Twitter },
    { value: "tiktok", label: "TikTok", icon: Instagram },
  ];

  const sortOptions = [
    { value: "relevance", label: "Relevance" },
    { value: "followers_desc", label: "Followers (High to Low)" },
    { value: "followers_asc", label: "Followers (Low to High)" },
    { value: "engagement_desc", label: "Engagement Rate (High to Low)" },
    { value: "satisfaction_desc", label: "Client Satisfaction" },
    { value: "recent_activity", label: "Recent Activity" },
    { value: "price_asc", label: "Price (Low to High)" },
    { value: "price_desc", label: "Price (High to Low)" },
  ];

  const countries = [
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "India",
    "Brazil",
    "Mexico",
    "Japan",
    "South Korea",
    "Netherlands",
    "Sweden",
    "Norway",
    "Denmark",
  ];

  const contentCategories = [
    "product_reviews",
    "tutorials",
    "unboxing",
    "lifestyle_vlogs",
    "fashion_hauls",
    "cooking_videos",
    "fitness_routines",
    "travel_vlogs",
    "gaming_streams",
    "educational_content",
    "comedy_skits",
    "music_covers",
    "art_tutorials",
    "tech_reviews",
    "beauty_tutorials",
    "dance_videos",
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem("creator_search_history");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }

    // Initial load of creators
    fetchCreators();
  }, []);

  useEffect(() => {
    // Apply filters and sorting when data changes
    applyFiltersAndSort();
  }, [creators, filters, sortBy, searchQuery]);

  const saveSearchToHistory = (query, type = "text") => {
    const newSearch = {
      query,
      type,
      timestamp: Date.now(),
      filters: { ...filters },
    };

    const updated = [
      newSearch,
      ...searchHistory.filter((s) => s.query !== query),
    ].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem("creator_search_history", JSON.stringify(updated));
  };

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.creators.getAll({
        limit: 100,
        include_ai_enhanced: true,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCreators(result.data.creators || []);
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

  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) return;

    setIsAISearching(true);
    setError("");

    try {
      const searchOptions = {
        filters: { ...filters },
        max_results: 50,
        use_hybrid_search: true,
        include_metadata: true,
        include_scores: true,
      };

      const response = await apiClient.search.aiSearch(
        aiSearchQuery,
        filters,
        searchOptions
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const searchResults = result.data.results.map((r) => ({
          ...r.creator_data,
          search_score: r.search_score,
          search_metadata: r.search_metadata,
        }));

        setCreators(searchResults);
        saveSearchToHistory(aiSearchQuery, "ai");
        setSuccessMessage(
          `Found ${searchResults.length} creators using AI search`
        );
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    } finally {
      setIsAISearching(false);
    }
  };

  const fetchSearchSuggestions = async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const response = await apiClient.search.getSuggestions({
        q: query,
        limit: 8,
        include_trending: true,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSearchSuggestions(result.data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = creators.filter((creator) => {
      // Text search
      const matchesSearch =
        !searchQuery ||
        creator.creator_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.niche?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.content_categories?.some((cat) =>
          cat.toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Advanced filters
      const matchesNiche = !filters.niche || creator.niche === filters.niche;

      const followers =
        creator.platform_metrics?.[creator.primary_platform]?.follower_count ||
        0;
      const tier = getCreatorTier(followers);
      const matchesTier = !filters.tier || tier === filters.tier;

      const matchesPlatform =
        !filters.platform || creator.primary_platform === filters.platform;

      const matchesMinFollowers =
        !filters.min_followers || followers >= parseInt(filters.min_followers);
      const matchesMaxFollowers =
        !filters.max_followers || followers <= parseInt(filters.max_followers);

      const engagement =
        creator.platform_metrics?.[creator.primary_platform]?.engagement_rate ||
        0;
      const matchesMinEngagement =
        !filters.min_engagement ||
        engagement >= parseFloat(filters.min_engagement);
      const matchesMaxEngagement =
        !filters.max_engagement ||
        engagement <= parseFloat(filters.max_engagement);

      const matchesCountry =
        !filters.location_country ||
        creator.location_country === filters.location_country;
      const matchesCity =
        !filters.location_city ||
        creator.location_city
          ?.toLowerCase()
          .includes(filters.location_city.toLowerCase());

      const matchesVerification =
        !filters.verification_status ||
        creator.verification_status === filters.verification_status;

      const matchesCollaborations =
        !filters.min_total_collaborations ||
        (creator.total_collaborations || 0) >=
          parseInt(filters.min_total_collaborations);

      const matchesSatisfaction =
        !filters.min_satisfaction_score ||
        (creator.client_satisfaction_score || 0) >=
          parseFloat(filters.min_satisfaction_score);

      return (
        matchesSearch &&
        matchesNiche &&
        matchesTier &&
        matchesPlatform &&
        matchesMinFollowers &&
        matchesMaxFollowers &&
        matchesMinEngagement &&
        matchesMaxEngagement &&
        matchesCountry &&
        matchesCity &&
        matchesVerification &&
        matchesCollaborations &&
        matchesSatisfaction
      );
    });

    // Apply sorting
    switch (sortBy) {
      case "followers_desc":
        filtered.sort((a, b) => {
          const aFollowers =
            a.platform_metrics?.[a.primary_platform]?.follower_count || 0;
          const bFollowers =
            b.platform_metrics?.[b.primary_platform]?.follower_count || 0;
          return bFollowers - aFollowers;
        });
        break;
      case "followers_asc":
        filtered.sort((a, b) => {
          const aFollowers =
            a.platform_metrics?.[a.primary_platform]?.follower_count || 0;
          const bFollowers =
            b.platform_metrics?.[b.primary_platform]?.follower_count || 0;
          return aFollowers - bFollowers;
        });
        break;
      case "engagement_desc":
        filtered.sort((a, b) => {
          const aEngagement =
            a.platform_metrics?.[a.primary_platform]?.engagement_rate || 0;
          const bEngagement =
            b.platform_metrics?.[b.primary_platform]?.engagement_rate || 0;
          return bEngagement - aEngagement;
        });
        break;
      case "satisfaction_desc":
        filtered.sort(
          (a, b) =>
            (b.client_satisfaction_score || 0) -
            (a.client_satisfaction_score || 0)
        );
        break;
      case "recent_activity":
        filtered.sort(
          (a, b) =>
            new Date(b.last_active_date || 0) -
            new Date(a.last_active_date || 0)
        );
        break;
      case "relevance":
      default:
        filtered.sort((a, b) => (b.search_score || 0) - (a.search_score || 0));
        break;
    }

    setFilteredCreators(filtered);
  };

  const getCreatorTier = (followers) => {
    if (followers < 10000) return "nano";
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

  const getEngagementColor = (rate) => {
    if (rate >= 6) return "text-green-600";
    if (rate >= 3) return "text-blue-600";
    if (rate >= 1) return "text-yellow-600";
    return "text-red-600";
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num?.toString() || "0";
  };

  const getPlatformIcon = (platform) => {
    const platformObj = platforms.find((p) => p.value === platform);
    return platformObj ? platformObj.icon : Users;
  };

  const handleContactCreator = (creator) => {
    setSelectedCreator(creator);
    setContactForm({
      subject: `Collaboration Opportunity from ${user?.brand_name}`,
      message: `Hi ${creator.creator_name},

I hope this message finds you well! I'm reaching out from ${user?.brand_name} regarding a potential collaboration opportunity.

We believe your content and audience would be a perfect fit for our brand, and we'd love to discuss how we can work together to create amazing content.

I'd be happy to provide more details about the collaboration and answer any questions you might have.

Looking forward to hearing from you!

Best regards,
${user?.name}
${user?.brand_name}`,
      campaign_id: "",
    });
    setShowContactModal(true);
  };

  const handleCallCreator = async (creator) => {
    try {
      const response = await apiClient.calling.initiate({
        creator_id: creator.id,
        call_purpose: "collaboration_inquiry",
        brand_name: user?.brand_name,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSuccessMessage(
          "AI call initiated! The creator will be contacted shortly."
        );
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const handleSendEmail = async () => {
    try {
      const response = await apiClient.mail.sendBrandCollab(
        [selectedCreator.id],
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

  const handleBulkEmail = async () => {
    try {
      const response = await apiClient.mail.sendBrandCollab(
        selectedCreators,
        user?.brand_name || "Your Brand"
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setShowBulkActionsModal(false);
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

  const clearFilters = () => {
    setFilters({
      niche: "",
      tier: "",
      platform: "",
      min_followers: "",
      max_followers: "",
      min_engagement: "",
      max_engagement: "",
      location_country: "",
      location_city: "",
      verification_status: "",
      audience_age_primary: "",
      audience_gender_primary: "",
      min_total_collaborations: "",
      min_satisfaction_score: "",
      languages: "",
      content_categories: "",
    });
    setSearchQuery("");
    setAiSearchQuery("");
  };

  const exportResults = () => {
    const csvData = filteredCreators.map((creator) => ({
      Name: creator.creator_name,
      Platform: creator.primary_platform,
      Followers:
        creator.platform_metrics?.[creator.primary_platform]?.follower_count ||
        0,
      Engagement:
        creator.platform_metrics?.[creator.primary_platform]?.engagement_rate ||
        0,
      Niche: creator.niche,
      Location: `${creator.location_city || ""}, ${
        creator.location_country || ""
      }`,
      Email: creator.business_email,
      Satisfaction: creator.client_satisfaction_score || 0,
    }));

    const csv = [
      Object.keys(csvData[0]).join(","),
      ...csvData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creators_search_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
          <Users className="w-8 h-8 mr-3" />
          Creator Discovery
        </h1>
        <p className="text-gray-600">
          Find the perfect creators for your brand using AI-powered search and
          advanced filters
        </p>
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

      {/* AI Search Section */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            AI-Powered Creator Search
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Describe what kind of creators you're looking for..."
                value={aiSearchQuery}
                onChange={(e) => {
                  setAiSearchQuery(e.target.value);
                  fetchSearchSuggestions(e.target.value);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10 max-h-64 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAiSearchQuery(suggestion);
                        setSearchSuggestions([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center">
                        <Search className="w-4 h-4 text-gray-400 mr-2" />
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={handleAISearch}
              loading={isAISearching}
              icon={Brain}
              size="lg"
            >
              AI Search
            </Button>
          </div>

          {/* Quick Search Examples */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-primary-700 font-medium">Try:</span>
            {[
              "Fashion influencers with high engagement in beauty niche",
              "Tech reviewers with 50K+ followers on YouTube",
              "Fitness creators who make workout videos",
              "Food bloggers in the US with cooking tutorials",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setAiSearchQuery(example)}
                className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full hover:bg-primary-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>

          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Recent searches:</p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (search.type === "ai") {
                        setAiSearchQuery(search.query);
                      } else {
                        setSearchQuery(search.query);
                      }
                      setFilters(search.filters || {});
                    }}
                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors flex items-center"
                  >
                    {search.type === "ai" ? (
                      <Brain className="w-3 h-3 mr-1" />
                    ) : (
                      <Search className="w-3 h-3 mr-1" />
                    )}
                    {search.query}
                    <Clock className="w-3 h-3 ml-1 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Regular Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search creators by name, bio, or niche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
            >
              Advanced Filters
            </Button>

            <Button variant="ghost" onClick={clearFilters}>
              Clear All
            </Button>

            {selectedCreators.length > 0 && (
              <Button
                variant="primary"
                icon={Send}
                onClick={() => setShowBulkActionsModal(true)}
              >
                Bulk Actions ({selectedCreators.length})
              </Button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Basic Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niche
                </label>
                <select
                  value={filters.niche}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, niche: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Niches</option>
                  {niches.map((niche) => (
                    <option key={niche} value={niche}>
                      {niche}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier
                </label>
                <select
                  value={filters.tier}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, tier: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Tiers</option>
                  {tiers.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform
                </label>
                <select
                  value={filters.platform}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  Verification
                </label>
                <select
                  value={filters.verification_status}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      verification_status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Creators</option>
                  <option value="verified">Verified Only</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            {/* Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                label="Min Followers"
                type="number"
                placeholder="1000"
                value={filters.min_followers}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    min_followers: e.target.value,
                  }))
                }
                containerClassName="text-sm"
              />

              <Input
                label="Max Followers"
                type="number"
                placeholder="100000"
                value={filters.max_followers}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    max_followers: e.target.value,
                  }))
                }
                containerClassName="text-sm"
              />

              <Input
                label="Min Engagement (%)"
                type="number"
                placeholder="3.0"
                value={filters.min_engagement}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    min_engagement: e.target.value,
                  }))
                }
                containerClassName="text-sm"
              />

              <Input
                label="Min Satisfaction Score"
                type="number"
                placeholder="4.0"
                value={filters.min_satisfaction_score}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    min_satisfaction_score: e.target.value,
                  }))
                }
                containerClassName="text-sm"
              />
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  value={filters.location_country}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      location_country: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City"
                placeholder="New York, Los Angeles, etc."
                value={filters.location_city}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    location_city: e.target.value,
                  }))
                }
                icon={MapPin}
                containerClassName="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <p className="text-gray-600">
            {isLoading
              ? "Loading..."
              : `${filteredCreators.length} creators found`}
          </p>

          {filteredCreators.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={exportResults}
            >
              Export CSV
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${
                viewMode === "list"
                  ? "bg-primary-600 text-white"
                  : "text-gray-600"
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Creator Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creators...</p>
          </div>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Creators Found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or using different keywords
          </p>
          <div className="space-x-3">
            <Button variant="primary" onClick={clearFilters}>
              Clear All Filters
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setAiSearchQuery("fashion influencers with high engagement")
              }
            >
              Try Sample Search
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {filteredCreators.map((creator) => {
            const PlatformIcon = getPlatformIcon(creator.primary_platform);
            const tier = getCreatorTier(
              creator.platform_metrics?.[creator.primary_platform]
                ?.follower_count || 0
            );
            const isSelected = selectedCreators.includes(creator.id);

            if (viewMode === "list") {
              // List view layout
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(
                            tier
                          )}`}
                        >
                          {tier}
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

                      <p className="text-gray-600 text-sm line-clamp-2">
                        {creator.bio || "No bio available"}
                      </p>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">
                          {formatNumber(
                            creator.platform_metrics?.[creator.primary_platform]
                              ?.follower_count || 0
                          )}
                        </p>
                        <p className="text-xs text-gray-500">Followers</p>
                      </div>

                      <div className="text-center">
                        <p
                          className={`text-lg font-bold ${getEngagementColor(
                            creator.platform_metrics?.[creator.primary_platform]
                              ?.engagement_rate || 0
                          )}`}
                        >
                          {(
                            creator.platform_metrics?.[creator.primary_platform]
                              ?.engagement_rate || 0
                          ).toFixed(1)}
                          %
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

            // Grid view layout (existing code)
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

                    <div className="flex items-center space-x-1">
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Bookmark className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getTierColor(
                          tier
                        )}`}
                      >
                        {tier.charAt(0).toUpperCase() + tier.slice(1)}{" "}
                        Influencer
                      </span>

                      {creator.niche && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                          {creator.niche}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {creator.bio || "No bio available"}
                    </p>

                    {creator.location_city && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {creator.location_city}, {creator.location_country}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.follower_count || 0
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>

                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${getEngagementColor(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.engagement_rate || 0
                        )}`}
                      >
                        {(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.engagement_rate || 0
                        ).toFixed(1)}
                        %
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
                        {formatNumber(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.avg_views || 0
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-red-400 mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.avg_likes || 0
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-blue-400 mb-1">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(
                          creator.platform_metrics?.[creator.primary_platform]
                            ?.avg_comments || 0
                        )}
                      </p>
                    </div>
                  </div>

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

                    {creator.pricing?.[creator.primary_platform]
                      ?.sponsored_post && (
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          $
                          {
                            creator.pricing[creator.primary_platform]
                              .sponsored_post
                          }
                        </p>
                        <p className="text-xs text-gray-500">per post</p>
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
                      AI Call
                    </Button>
                  </div>

                  {/* Quick Links */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <Link
                      href={`/creators/${creator.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      View Full Profile
                    </Link>

                    {creator.search_score && (
                      <span className="text-xs text-gray-500">
                        Match: {(creator.search_score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contact ${selectedCreator?.creator_name}`}
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSendEmail} icon={Send}>
              Send Email
            </Button>
          </div>
        }
      >
        {selectedCreator && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={
                  selectedCreator.profile_image_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedCreator.creator_name
                  )}&background=3B82F6&color=fff`
                }
                alt={selectedCreator.creator_name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedCreator.creator_name}
                </h3>
                <p className="text-sm text-gray-500">{selectedCreator.niche}</p>
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
                💡 <strong>Tip:</strong> Personalize your message and mention
                specific content from their profile to increase response rates.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Actions Modal */}
      <Modal
        isOpen={showBulkActionsModal}
        onClose={() => setShowBulkActionsModal(false)}
        title={`Bulk Actions - ${selectedCreators.length} Creators Selected`}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setShowBulkActionsModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleBulkEmail} icon={Send}>
              Send Bulk Email
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">
              You have selected {selectedCreators.length} creators for bulk
              actions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" fullWidth icon={Send}>
              Send Bulk Email
            </Button>
            <Button variant="outline" fullWidth icon={Download}>
              Export Selected
            </Button>
            <Button variant="outline" fullWidth icon={Bookmark}>
              Add to List
            </Button>
            <Button variant="outline" fullWidth icon={PhoneCall}>
              Schedule Calls
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={() => setSelectedCreators([])}
              fullWidth
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
