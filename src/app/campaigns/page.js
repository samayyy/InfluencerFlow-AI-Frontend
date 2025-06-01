"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Modal from "../../components/common/Modal";
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  Play,
  Pause,
  Users,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  Sparkles,
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function CampaignManagementPage() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [newCampaign, setNewCampaign] = useState({
    campaign_name: "",
    campaign_type: "sponsored_post",
    product_id: "",
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
  });

  const campaignTypes = [
    { value: "sponsored_post", label: "Sponsored Post" },
    { value: "brand_ambassador", label: "Brand Ambassador" },
    { value: "product_review", label: "Product Review" },
    { value: "giveaway", label: "Giveaway" },
    { value: "event_promotion", label: "Event Promotion" },
  ];

  const campaignStatuses = [
    { value: "", label: "All Campaigns" },
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  useEffect(() => {
    fetchCampaigns();
    fetchProducts();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.campaigns.getMy();
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCampaigns(result.data.campaigns || []);
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

  const handleInputChange = (field, value) => {
    setNewCampaign((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError("");
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.campaign_name.trim()) {
      setError("Campaign name is required");
      return;
    }

    setIsLoading(true);
    try {
      const campaignData = {
        ...newCampaign,
        brand_id: user.brand_id,
        budget: newCampaign.budget ? parseFloat(newCampaign.budget) : undefined,
        hashtags: newCampaign.hashtags
          ? newCampaign.hashtags.split(",").map((h) => h.trim())
          : [],
        product_id: newCampaign.product_id || undefined,
      };

      const response = await apiClient.campaigns.create(campaignData);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCampaigns((prev) => [result.data.campaign, ...prev]);
        setShowCreateModal(false);
        setNewCampaign({
          campaign_name: "",
          campaign_type: "sponsored_post",
          product_id: "",
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
        });
        setSuccessMessage("Campaign created successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
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

  const handleDeleteCampaign = async () => {
    if (!campaignToDelete) return;

    try {
      const response = await apiClient.campaigns.delete(campaignToDelete.id);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCampaigns((prev) =>
          prev.filter((c) => c.id !== campaignToDelete.id)
        );
        setShowDeleteModal(false);
        setCampaignToDelete(null);
        setSuccessMessage("Campaign deleted successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(result.error);
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      setError(errorResult.error);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.campaign_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const calculateProgress = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / total) * 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Megaphone className="w-8 h-8 mr-3" />
              Campaigns
            </h1>
            <p className="text-gray-600 mt-2">
              Create and manage your influencer marketing campaigns
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Campaign
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

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {campaignStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter((c) => c.status === "active").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter((c) => c.status === "completed").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                $
                {campaigns
                  .reduce((sum, c) => sum + (c.budget || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {campaigns.length === 0 ? "No Campaigns Yet" : "No Campaigns Found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {campaigns.length === 0
              ? "Create your first campaign to start working with creators"
              : "Try adjusting your search or filter criteria"}
          </p>
          {campaigns.length === 0 && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowCreateModal(true)}
            >
              Create Your First Campaign
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCampaigns.map((campaign) => {
            const StatusIcon = getStatusIcon(campaign.status);
            const progress = calculateProgress(
              campaign.start_date,
              campaign.end_date
            );

            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 mr-3">
                          {campaign.campaign_name}
                        </h3>
                        <span
                          className={`
                          inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
                          ${getStatusColor(campaign.status)}
                        `}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {campaign.status || "draft"}
                        </span>
                      </div>

                      <p className="text-gray-600 mb-3">
                        {campaign.description || "No description provided"}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          {campaignTypes.find(
                            (t) => t.value === campaign.campaign_type
                          )?.label || campaign.campaign_type}
                        </div>

                        {campaign.product_name && (
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            {campaign.product_name}
                          </div>
                        )}

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(campaign.start_date)} -{" "}
                          {formatDate(campaign.end_date)}
                        </div>

                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(campaign.budget, campaign.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>

                      <Link
                        href={`/dashboard/campaigns/${campaign.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </Link>

                      <button
                        onClick={() => {
                          setCampaignToDelete(campaign);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {campaign.start_date && campaign.end_date && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Campaign Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Campaign Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.selected_influencers?.length || 0}
                      </p>
                      <p className="text-sm text-gray-600">Creators</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.performance_metrics?.total_reach || "0"}
                      </p>
                      <p className="text-sm text-gray-600">Total Reach</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.performance_metrics?.engagement_rate || "0"}%
                      </p>
                      <p className="text-sm text-gray-600">Engagement</p>
                    </div>

                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {campaign.performance_metrics?.roi || "0"}%
                      </p>
                      <p className="text-sm text-gray-600">ROI</p>
                    </div>
                  </div>

                  {/* AI Recommendations Badge */}
                  {campaign.ai_recommendations && (
                    <div className="mt-4 inline-flex items-center text-xs text-primary-600">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI creator recommendations available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Campaign"
        size="xl"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateCampaign}
              loading={isLoading}
            >
              Create Campaign
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Campaign Name"
              placeholder="Enter campaign name"
              value={newCampaign.campaign_name}
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
                value={newCampaign.campaign_type}
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
                value={newCampaign.product_id}
                onChange={(e) =>
                  handleInputChange("product_id", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Budget"
              type="number"
              placeholder="5000"
              value={newCampaign.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
              icon={DollarSign}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={newCampaign.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
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
              value={newCampaign.start_date}
              onChange={(e) => handleInputChange("start_date", e.target.value)}
              icon={Calendar}
            />

            <Input
              label="End Date"
              type="date"
              value={newCampaign.end_date}
              onChange={(e) => handleInputChange("end_date", e.target.value)}
              icon={Calendar}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Describe your campaign goals and requirements..."
              value={newCampaign.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
              value={newCampaign.objectives}
              onChange={(e) => handleInputChange("objectives", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Guidelines
            </label>
            <textarea
              rows={3}
              placeholder="Provide guidelines for content creation..."
              value={newCampaign.content_guidelines}
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
              value={newCampaign.hashtags}
              onChange={(e) => handleInputChange("hashtags", e.target.value)}
              helperText="Separate hashtags with commas"
            />

            <Input
              label="Mention Requirements"
              placeholder="@yourbrand"
              value={newCampaign.mention_requirements}
              onChange={(e) =>
                handleInputChange("mention_requirements", e.target.value)
              }
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="approval_required"
              checked={newCampaign.approval_required}
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
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Campaign"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCampaign}>
              Delete Campaign
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Delete "{campaignToDelete?.campaign_name}"?
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. All campaign data and creator
            relationships will be permanently removed.
          </p>
        </div>
      </Modal>
    </div>
  );
}
