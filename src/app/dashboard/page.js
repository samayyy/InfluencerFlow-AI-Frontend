"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button";
import {
  TrendingUp,
  Users,
  Megaphone,
  Package,
  Plus,
  ArrowUpRight,
  Calendar,
  Target,
  DollarSign,
  Eye,
  MessageCircle,
  Star,
  Activity,
  Clock,
  CheckCircle,
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
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data - replace with real API calls
  const stats = {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalCreators: 247,
    totalReach: 1200000,
    engagement: 4.2,
    roi: 325,
  };

  const chartData = [
    { name: "Mon", campaigns: 4, reach: 45000, engagement: 3.2 },
    { name: "Tue", campaigns: 3, reach: 52000, engagement: 4.1 },
    { name: "Wed", campaigns: 5, reach: 48000, engagement: 3.8 },
    { name: "Thu", campaigns: 7, reach: 61000, engagement: 4.5 },
    { name: "Fri", campaigns: 6, reach: 55000, engagement: 4.2 },
    { name: "Sat", campaigns: 8, reach: 67000, engagement: 4.8 },
    { name: "Sun", campaigns: 4, reach: 43000, engagement: 3.9 },
  ];

  const campaignStatusData = [
    { name: "Active", value: 5, color: "#10B981" },
    { name: "Completed", value: 7, color: "#3B82F6" },
    { name: "Draft", value: 3, color: "#F59E0B" },
    { name: "Paused", value: 2, color: "#EF4444" },
  ];

  const recentActivities = [
    {
      id: 1,
      type: "campaign_created",
      title: 'New campaign "Summer Collection" created',
      time: "2 hours ago",
      icon: Megaphone,
      color: "blue",
    },
    {
      id: 2,
      type: "creator_contacted",
      title: "Reached out to 5 new creators",
      time: "4 hours ago",
      icon: MessageCircle,
      color: "green",
    },
    {
      id: 3,
      type: "campaign_completed",
      title: 'Campaign "Spring Launch" completed',
      time: "1 day ago",
      icon: CheckCircle,
      color: "purple",
    },
    {
      id: 4,
      type: "product_added",
      title: 'New product "Wireless Headphones" added',
      time: "2 days ago",
      icon: Package,
      color: "orange",
    },
  ];

  const topCreators = [
    {
      id: 1,
      name: "Sarah Johnson",
      niche: "Fashion & Beauty",
      followers: 125000,
      engagement: 4.8,
      avatar:
        "https://ui-avatars.com/api/?name=Sarah+Johnson&background=3B82F6&color=fff",
    },
    {
      id: 2,
      name: "Mike Chen",
      niche: "Tech & Gaming",
      followers: 89000,
      engagement: 5.2,
      avatar:
        "https://ui-avatars.com/api/?name=Mike+Chen&background=10B981&color=fff",
    },
    {
      id: 3,
      name: "Emma Davis",
      niche: "Lifestyle",
      followers: 156000,
      engagement: 4.1,
      avatar:
        "https://ui-avatars.com/api/?name=Emma+Davis&background=F59E0B&color=fff",
    },
  ];

  const quickActions = [
    {
      title: "Create Campaign",
      description: "Start a new influencer marketing campaign",
      href: "/campaigns/create",
      icon: Megaphone,
      color: "blue",
    },
    {
      title: "Find Creators",
      description: "Discover creators perfect for your brand",
      href: "/creators",
      icon: Users,
      color: "green",
    },
    {
      title: "Add Product",
      description: "Add a new product to promote",
      href: "/products/create",
      icon: Package,
      color: "purple",
    },
    {
      title: "View Analytics",
      description: "Check your campaign performance",
      href: "/analytics",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your influencer campaigns
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>

            <Button
              variant="primary"
              icon={Plus}
              href="/dashboard/campaigns/create"
            >
              New Campaign
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Campaigns
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalCampaigns}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reach</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(stats.totalReach)}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +18% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Avg. Engagement
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.engagement}%
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +0.8% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
              <p className="text-3xl font-bold text-gray-900">{stats.roi}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +25% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Campaign Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Campaign Performance
            </h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg">
                Reach
              </button>
              <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">
                Engagement
              </button>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="reach"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Campaign Status
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={campaignStatusData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {campaignStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {campaignStatusData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <Link
              href="/dashboard/activity"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${activity.color === "blue" ? "bg-blue-100" : ""}
                  ${activity.color === "green" ? "bg-green-100" : ""}
                  ${activity.color === "purple" ? "bg-purple-100" : ""}
                  ${activity.color === "orange" ? "bg-orange-100" : ""}
                `}
                >
                  <activity.icon
                    className={`
                    w-4 h-4
                    ${activity.color === "blue" ? "text-blue-600" : ""}
                    ${activity.color === "green" ? "text-green-600" : ""}
                    ${activity.color === "purple" ? "text-purple-600" : ""}
                    ${activity.color === "orange" ? "text-orange-600" : ""}
                  `}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Creators */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performing Creators
            </h3>
            <Link
              href="/dashboard/creators"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View all
            </Link>
          </div>

          <div className="space-y-4">
            {topCreators.map((creator) => (
              <div key={creator.id} className="flex items-center space-x-3">
                <img
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {creator.name}
                  </p>
                  <p className="text-xs text-gray-500">{creator.niche}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatNumber(creator.followers)} followers
                  </p>
                  <div className="flex items-center text-xs text-yellow-600">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    {creator.engagement}% engagement
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
            >
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform
                ${action.color === "blue" ? "bg-blue-100 text-blue-600" : ""}
                ${action.color === "green" ? "bg-green-100 text-green-600" : ""}
                ${
                  action.color === "purple"
                    ? "bg-purple-100 text-purple-600"
                    : ""
                }
                ${
                  action.color === "orange"
                    ? "bg-orange-100 text-orange-600"
                    : ""
                }
              `}
              >
                <action.icon className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 mt-2" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
