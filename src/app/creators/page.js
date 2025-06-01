"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
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
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function CreatorDiscoveryPage() {
  const { user } = useAuth();
  const [creators, setCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    niche: "",
    tier: "",
    platform: "",
    min_followers: "",
    max_followers: "",
    min_engagement: "",
    location: "",
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
  ];

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [creators, filters, searchQuery]);

  const fetchCreators = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.creators.getAll();
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

  const applyFilters = () => {
    let filtered = creators.filter((creator) => {
      const matchesSearch =
        creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        creator.niche?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesNiche = !filters.niche || creator.niche === filters.niche;
      const matchesTier =
        !filters.tier ||
        getCreatorTier(creator.followers_count) === filters.tier;
      const matchesPlatform =
        !filters.platform || creator.primary_platform === filters.platform;

      const matchesMinFollowers =
        !filters.min_followers ||
        creator.followers_count >= parseInt(filters.min_followers);
      const matchesMaxFollowers =
        !filters.max_followers ||
        creator.followers_count <= parseInt(filters.max_followers);
      const matchesMinEngagement =
        !filters.min_engagement ||
        creator.engagement_rate >= parseFloat(filters.min_engagement);

      const matchesLocation =
        !filters.location ||
        creator.location
          ?.toLowerCase()
          .includes(filters.location.toLowerCase());

      return (
        matchesSearch &&
        matchesNiche &&
        matchesTier &&
        matchesPlatform &&
        matchesMinFollowers &&
        matchesMaxFollowers &&
        matchesMinEngagement &&
        matchesLocation
      );
    });

    setFilteredCreators(filtered);
  };

  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) return;

    setIsAISearching(true);
    try {
      const response = await apiClient.search.aiSearch(aiSearchQuery, filters, {
        max_results: 20,
        use_hybrid_search: true,
        include_metadata: true,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const searchResults = result.data.results.map(
          (r) => r.creator_data || r
        );
        setFilteredCreators(searchResults);
        setError("");
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
        limit: 5,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSearchSuggestions(result.data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    }
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
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getPlatformIcon = (platform) => {
    const platformObj = platforms.find((p) => p.value === platform);
    return platformObj ? platformObj.icon : Users;
  };

  const handleContactCreator = (creator) => {
    setSelectedCreator(creator);
    setShowContactModal(true);
  };

  const clearFilters = () => {
    setFilters({
      niche: "",
      tier: "",
      platform: "",
      min_followers: "",
      max_followers: "",
      min_engagement: "",
      location: "",
    });
    setSearchQuery("");
    setAiSearchQuery("");
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
          Find the perfect creators for your brand using AI-powered search
        </p>
      </div>

      {/* AI Search */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Sparkles className="w-6 h-6 text-primary-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">
            AI-Powered Search
          </h2>
        </div>

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
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAiSearchQuery(suggestion);
                      setSearchSuggestions([]);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            onClick={handleAISearch}
            loading={isAISearching}
            icon={Zap}
          >
            AI Search
          </Button>
        </div>

        <p className="text-sm text-primary-700 mt-2">
          Try: "Fashion influencers with high engagement in beauty niche" or
          "Tech reviewers with 50K+ followers"
        </p>
      </div>

      {/* Filters and Search */}
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
              Filters
            </Button>

            <Button variant="ghost" onClick={clearFilters}>
              Clear All
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

              <Input
                label="Min Engagement Rate (%)"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                label="Location"
                placeholder="New York, US"
                value={filters.location}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, location: e.target.value }))
                }
                icon={MapPin}
                containerClassName="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {isLoading
            ? "Loading..."
            : `${filteredCreators.length} creators found`}
        </p>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Relevance</option>
            <option>Followers (High to Low)</option>
            <option>Followers (Low to High)</option>
            <option>Engagement Rate</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Creators Grid */}
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
          <Button variant="primary" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => {
            const PlatformIcon = getPlatformIcon(creator.primary_platform);
            const tier = getCreatorTier(creator.followers_count);

            return (
              <div
                key={creator.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                {/* Creator Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <img
                        src={
                          creator.profile_picture_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            creator.name
                          )}&background=3B82F6&color=fff`
                        }
                        alt={creator.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {creator.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <PlatformIcon className="w-4 h-4 mr-1" />
                          {creator.username ||
                            "@" +
                              creator.name.toLowerCase().replace(/\s+/g, "")}
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

                    {creator.location && (
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-4 h-4 mr-1" />
                        {creator.location}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">
                        {formatNumber(creator.followers_count)}
                      </p>
                      <p className="text-xs text-gray-500">Followers</p>
                    </div>

                    <div className="text-center">
                      <p
                        className={`text-lg font-bold ${getEngagementColor(
                          creator.engagement_rate
                        )}`}
                      >
                        {creator.engagement_rate?.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Engagement</p>
                    </div>
                  </div>

                  {/* Recent Performance */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="flex items-center justify-center text-gray-400 mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(
                          creator.avg_views ||
                            Math.floor(creator.followers_count * 0.1)
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-red-400 mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(
                          creator.avg_likes ||
                            Math.floor(creator.followers_count * 0.05)
                        )}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-center text-blue-400 mb-1">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium">
                        {formatNumber(
                          creator.avg_comments ||
                            Math.floor(creator.followers_count * 0.01)
                        )}
                      </p>
                    </div>
                  </div>

                  {/* AI Enhancement Badge */}
                  {creator.ai_enhanced && (
                    <div className="flex items-center text-xs text-primary-600 mb-4">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI-enhanced profile data
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/dashboard/creators/${creator.id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View Profile
                    </Link>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleContactCreator(creator)}
                      className="flex-1"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Creator Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contact ${selectedCreator?.name}`}
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" icon={Mail}>
              Send Message
            </Button>
          </div>
        }
      >
        {selectedCreator && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={
                  selectedCreator.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedCreator.name
                  )}&background=3B82F6&color=fff`
                }
                alt={selectedCreator.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedCreator.name}
                </h3>
                <p className="text-sm text-gray-500">{selectedCreator.niche}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                placeholder="Collaboration Opportunity"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Hi [Creator Name], I'd love to discuss a potential collaboration opportunity with our brand..."
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
    </div>
  );
}
