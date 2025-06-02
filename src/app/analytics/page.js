"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  BarChart3,
  TrendingUp,
  Search,
  Clock,
  Users,
  Target,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Brain,
  Zap,
  Eye,
  MousePointer,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import apiClient, { apiUtils } from "../../lib/api";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Date range state
  const [dateRange, setDateRange] = useState("7d");
  const [customDateRange, setCustomDateRange] = useState({
    start: "",
    end: "",
  });
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Analytics data state
  const [searchAnalytics, setSearchAnalytics] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [searchTrends, setSearchTrends] = useState(null);

  // UI state
  const [selectedMetric, setSelectedMetric] = useState("total_searches");
  const [showFilters, setShowFilters] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchAllAnalytics();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchRealTimeStats, 30000);
    return () => clearInterval(interval);
  }, [dateRange, customDateRange]);

  const fetchAllAnalytics = async () => {
    setIsLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchSearchAnalytics(),
        fetchRealTimeStats(),
        fetchPerformanceReport(),
        fetchSearchTrends(),
      ]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSearchAnalytics = async () => {
    try {
      const params = getDateRangeParams();
      const response = await apiClient.analytics.search.getAnalytics(params);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSearchAnalytics(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching search analytics:", error);
      throw error;
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      const response = await apiClient.analytics.search.getRealTimeStats();
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setRealTimeStats(result.data);
      } else {
        console.error("Error fetching real-time stats:", result.error);
      }
    } catch (error) {
      console.error("Error fetching real-time stats:", error);
    }
  };

  const fetchPerformanceReport = async () => {
    try {
      const params = { days: getDaysFromRange() };
      const response = await apiClient.analytics.search.getPerformanceReport(
        params
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setPerformanceReport(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching performance report:", error);
      throw error;
    }
  };

  const fetchSearchTrends = async () => {
    try {
      const params = { period: dateRange, limit: 10 };
      const response = await apiClient.analytics.search.getTrends(params);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setSearchTrends(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error fetching search trends:", error);
      throw error;
    }
  };

  const getDateRangeParams = () => {
    if (
      dateRange === "custom" &&
      customDateRange.start &&
      customDateRange.end
    ) {
      return {
        start_date: customDateRange.start,
        end_date: customDateRange.end,
      };
    } else {
      return { days: getDaysFromRange() };
    }
  };

  const getDaysFromRange = () => {
    switch (dateRange) {
      case "1d":
        return "1";
      case "7d":
        return "7";
      case "30d":
        return "30";
      case "90d":
        return "90";
      default:
        return "7";
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllAnalytics();
    setIsRefreshing(false);
    setSuccessMessage("Analytics data refreshed");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleExportReport = async () => {
    try {
      const params = { days: getDaysFromRange() };
      const response = await apiClient.analytics.search.getPerformanceReport(
        params
      );
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `search-analytics-report-${
          new Date().toISOString().split("T")[0]
        }.json`;
        link.click();

        setSuccessMessage("Report exported successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error) {
      setError("Failed to export report");
    }
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatPercentage = (value) => {
    return `${parseFloat(value || 0).toFixed(1)}%`;
  };

  const getMetricColor = (current, previous) => {
    if (!previous || current === previous) return "text-gray-600";
    return current > previous ? "text-green-600" : "text-red-600";
  };

  const getMetricIcon = (current, previous) => {
    if (!previous || current === previous) return Minus;
    return current > previous ? ArrowUp : ArrowDown;
  };

  const chartColors = {
    primary: "#3B82F6",
    secondary: "#10B981",
    accent: "#F59E0B",
    danger: "#EF4444",
    purple: "#8B5CF6",
  };

  const pieChartColors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
  ];

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center mb-2">
              <BarChart3 className="w-8 h-8 mr-3" />
              Search Analytics
            </h1>
            <p className="text-gray-600">
              Monitor your creator search performance and user engagement
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* Date Range Selector */}
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  if (e.target.value !== "custom") {
                    setShowCustomRange(false);
                  } else {
                    setShowCustomRange(true);
                  }
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 3 months</option>
                <option value="custom">Custom range</option>
              </select>
            </div>

            <Button
              variant="outline"
              icon={RefreshCw}
              onClick={handleRefresh}
              loading={isRefreshing}
              size="sm"
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              icon={Download}
              onClick={handleExportReport}
              size="sm"
            >
              Export
            </Button>
          </div>
        </div>

        {/* Custom Date Range */}
        {showCustomRange && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) =>
                    setCustomDateRange((prev) => ({
                      ...prev,
                      end: e.target.value,
                    }))
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
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

      {/* Real-time Status Bar */}
      {realTimeStats && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
              <span className="text-sm font-medium text-gray-900">
                Live Data
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-gray-600">System Status:</span>
                <span className="text-green-600 font-medium ml-1">
                  {realTimeStats.system_status?.search_service || "Healthy"}
                </span>
              </div>
              <div className="text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics Cards */}
      {searchAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Searches
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(searchAnalytics.summary.total_searches)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">
                    {searchAnalytics.summary.avg_daily_searches?.toFixed(1)}{" "}
                    avg/day
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Success Rate
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {searchAnalytics.summary.success_rate}
                </p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-sm text-gray-600">
                    {formatNumber(searchAnalytics.summary.successful_searches)}{" "}
                    successful
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Searches</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(
                    Object.values(searchAnalytics.search_intents || {}).reduce(
                      (sum, count) => sum + count,
                      0
                    )
                  )}
                </p>
                <div className="flex items-center mt-2">
                  <Brain className="w-4 h-4 text-purple-600 mr-1" />
                  <span className="text-sm text-purple-600">AI-powered</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Response Time
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {realTimeStats?.recent_patterns?.avg_response_time || "450ms"}
                </p>
                <div className="flex items-center mt-2">
                  <Zap className="w-4 h-4 text-orange-600 mr-1" />
                  <span className="text-sm text-orange-600">Fast</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Search Volume Chart */}
        {searchAnalytics && (
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Search Volume Trends
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedMetric("total_searches")}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    selectedMetric === "total_searches"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Volume
                </button>
                <button
                  onClick={() => setSelectedMetric("successful_searches")}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                    selectedMetric === "successful_searches"
                      ? "bg-primary-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Success
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={searchAnalytics.daily_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={`metrics.${selectedMetric}`}
                  stroke={chartColors.primary}
                  fill={chartColors.primary}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Search Intents Breakdown */}
        {searchAnalytics && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Search Intents
            </h3>

            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    searchAnalytics.search_intents || {}
                  ).map(([intent, count], index) => ({
                    name: intent.replace(/_/g, " "),
                    value: count,
                    color: pieChartColors[index % pieChartColors.length],
                  }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(searchAnalytics.search_intents || {}).map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={pieChartColors[index % pieChartColors.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2 mt-4">
              {Object.entries(searchAnalytics.search_intents || {}).map(
                ([intent, count], index) => (
                  <div
                    key={intent}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            pieChartColors[index % pieChartColors.length],
                        }}
                      />
                      <span className="text-sm text-gray-600 capitalize">
                        {intent.replace(/_/g, " ")}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(count)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Metrics */}
        {searchAnalytics && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Performance Metrics
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={Object.entries(
                  searchAnalytics.performance_metrics || {}
                ).map(([bucket, count]) => ({
                  name: bucket.replace(/_/g, " "),
                  count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill={chartColors.accent}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Search Trends */}
        {searchTrends && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Popular Search Queries
              </h3>
              <span className="text-xs text-gray-500">
                {searchTrends.period} period
              </span>
            </div>

            <div className="space-y-4">
              {searchTrends.popular_queries?.slice(0, 6).map((query, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {query.query_pattern}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg {query.avg_results} results
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {query.count}
                    </p>
                    <p className="text-xs text-gray-500">searches</p>
                  </div>
                </div>
              ))}
            </div>

            {searchTrends.trending_niches && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Trending Niches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {searchTrends.trending_niches.map((niche, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                    >
                      {niche.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Performance Report Summary */}
      {performanceReport && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Performance Report
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {performanceReport.period}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReportModal(true)}
              >
                View Details
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Total Searches</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(performanceReport.summary?.total_searches)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-gray-900">
                  {performanceReport.summary?.success_rate}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Avg Daily</span>
                <span className="font-semibold text-gray-900">
                  {performanceReport.summary?.avg_daily_searches?.toFixed(0)}
                </span>
              </div>
            </div>

            {/* Trends */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Trends Analysis</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Volume Trend</p>
                <div className="flex items-center">
                  <span className="capitalize font-medium text-gray-900">
                    {performanceReport.trends?.search_volume_trend}
                  </span>
                  {performanceReport.trends?.search_volume_trend ===
                  "increasing" ? (
                    <ArrowUp className="w-4 h-4 text-green-600 ml-2" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-600 ml-2" />
                  )}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Peak Day</p>
                <p className="font-medium text-gray-900">
                  {performanceReport.trends?.peak_day?.date}
                </p>
                <p className="text-xs text-gray-500">
                  {formatNumber(
                    performanceReport.trends?.peak_day?.metrics?.total_searches
                  )}{" "}
                  searches
                </p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recommendations</h4>
              <div className="space-y-2">
                {performanceReport.recommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-start"
                  >
                    <Info className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Detailed Performance Report"
        size="xl"
      >
        {performanceReport && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Report Period
                </h4>
                <p className="text-sm text-gray-600">
                  {performanceReport.period}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Generated</h4>
                <p className="text-sm text-gray-600">
                  {new Date(performanceReport.generated_at).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Summary Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(performanceReport.summary || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="text-center p-3 border border-gray-200 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {typeof value === "number"
                          ? formatNumber(value)
                          : value}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                Detailed Recommendations
              </h4>
              <div className="space-y-3">
                {performanceReport.recommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Info className="w-5 h-5 text-blue-600 mr-3" />
                      <p className="text-gray-900">{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
