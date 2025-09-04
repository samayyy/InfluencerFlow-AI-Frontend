// src/app/outreach/page.js
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import {
  PhoneCall,
  Mail,
  Clock,
  User,
  MessageSquare,
  BarChart3,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  TrendingUp,
  Calendar,
  Globe,
  Play,
  Pause,
  Volume2,
  FileText,
  Brain,
  Target,
  Award,
  Activity,
  Users,
  Headphones,
  Download,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Phone,
  Mic,
  MicOff,
  PlayCircle,
  StopCircle,
  MoreVertical,
  Sparkles,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Hash,
  MapPin,
  Building,
  Settings,
  DollarSign,
} from "lucide-react";
import apiClient, { apiUtils } from "../../lib/api";

export default function OutreachPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("calls");
  const [calls, setCalls] = useState([]);
  const [filteredCalls, setFilteredCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");
  const [error, setError] = useState("");
  const [expandedTranscript, setExpandedTranscript] = useState({});

  // Fetch calls data
  useEffect(() => {
    if (activeTab === "calls") {
      fetchCalls();
    }
  }, [activeTab]);

  // Apply filters
  useEffect(() => {
    applyFilters();
  }, [calls, searchQuery, statusFilter, directionFilter]);

  const fetchCalls = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await apiClient.calling.getAllCalls({
        limit: 100,
        include_conversation_details: true,
      });
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        setCalls(result.data.calls || []);
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
    let filtered = calls.filter((call) => {
      const matchesSearch =
        !searchQuery ||
        call.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.phone_number?.includes(searchQuery) ||
        call.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        call.campaign_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        call.conversation_details?.status === statusFilter ||
        call.twilio_details?.status === statusFilter;

      const matchesDirection =
        !directionFilter || call.direction === directionFilter;

      return matchesSearch && matchesStatus && matchesDirection;
    });

    setFilteredCalls(filtered);
  };

  const getCallStatusColor = (call) => {
    const twilioStatus = call.twilio_details?.status;
    const conversationStatus = call.conversation_details?.status;

    if (twilioStatus === "completed" && conversationStatus === "done") {
      return "bg-green-100 text-green-700 border-green-200";
    } else if (twilioStatus === "completed") {
      return "bg-blue-100 text-blue-700 border-blue-200";
    } else if (twilioStatus === "failed" || twilioStatus === "busy") {
      return "bg-red-100 text-red-700 border-red-200";
    } else if (twilioStatus === "in-progress") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getCallStatusIcon = (call) => {
    const twilioStatus = call.twilio_details?.status;
    const conversationStatus = call.conversation_details?.status;

    if (twilioStatus === "completed" && conversationStatus === "done") {
      return CheckCircle;
    } else if (twilioStatus === "failed" || twilioStatus === "busy") {
      return XCircle;
    } else if (twilioStatus === "in-progress") {
      return Clock;
    }
    return AlertCircle;
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getEvaluationScore = (result) => {
    if (result === "success") return { score: 100, color: "text-green-600" };
    if (result === "failure") return { score: 0, color: "text-red-600" };
    if (result === "unknown") return { score: 50, color: "text-gray-600" };
    return { score: 75, color: "text-blue-600" };
  };

  const toggleTranscriptExpansion = (callId) => {
    setExpandedTranscript((prev) => ({
      ...prev,
      [callId]: !prev[callId],
    }));
  };

  const handleViewCall = (call) => {
    setSelectedCall(call);
    setShowCallModal(true);
  };

  const CallCard = ({ call }) => {
    const StatusIcon = getCallStatusIcon(call);
    const duration = call.twilio_details?.duration
      ? parseInt(call.twilio_details.duration)
      : 0;
    const isExpanded = expandedTranscript[call.id];

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 animate-fade-in">
        {/* Call Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {call.creator_name || "Unknown Creator"}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                <span>{call.phone_number}</span>
                {call.direction && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{call.direction}</span>
                  </>
                )}
              </div>
              {call.campaign_name && (
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <Target className="w-4 h-4 mr-1" />
                  <span>{call.campaign_name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full border ${getCallStatusColor(
                call
              )}`}
            >
              <StatusIcon className="w-3 h-3 inline mr-1" />
              {call.twilio_details?.status || "unknown"}
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={Eye}
              onClick={() => handleViewCall(call)}
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Call Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {formatDuration(duration)}
            </p>
            <p className="text-xs text-gray-500">Duration</p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {formatDateTime(call.twilio_details?.startTime).split(" ")[0]}
            </p>
            <p className="text-xs text-gray-500">Date</p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {call.conversation_details?.transcript?.length || 0}
            </p>
            <p className="text-xs text-gray-500">Messages</p>
          </div>

          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Brain className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-sm font-medium text-gray-900">
              {call.conversation_details?.analysis?.call_successful ===
              "failure"
                ? "Failed"
                : call.conversation_details?.analysis?.call_successful ===
                  "success"
                ? "Success"
                : "Partial"}
            </p>
            <p className="text-xs text-gray-500">AI Result</p>
          </div>
        </div>

        {/* Evaluation Scores */}
        {call.conversation_details?.analysis?.evaluation_criteria_results && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Evaluation Scores
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(
                call.conversation_details.analysis.evaluation_criteria_results
              ).map(([criteria, result]) => {
                const { score, color } = getEvaluationScore(result.result);
                return (
                  <div
                    key={criteria}
                    className="p-2 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">
                        {criteria.replace(/_/g, " ")}
                      </span>
                      <span className={`text-xs font-medium ${color}`}>
                        {result.result}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Transcript Preview */}
        {call.conversation_details?.transcript && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Conversation Transcript
              </h4>
              <Button
                variant="ghost"
                size="sm"
                icon={isExpanded ? ChevronUp : ChevronDown}
                onClick={() => toggleTranscriptExpansion(call.id)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
            </div>

            <div
              className={`space-y-2 ${
                isExpanded ? "" : "max-h-32 overflow-hidden"
              }`}
            >
              {call.conversation_details.transcript
                .slice(0, isExpanded ? undefined : 3)
                .map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      message.role === "agent"
                        ? "bg-blue-50 border-l-2 border-blue-500"
                        : "bg-green-50 border-l-2 border-green-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">
                        {message.role === "agent" ? "AI Agent" : "Creator"}
                      </span>
                      {message.time_in_call_secs !== undefined && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(message.time_in_call_secs)}
                        </span>
                      )}
                    </div>
                    {message.message && (
                      <p className="text-sm text-gray-800">{message.message}</p>
                    )}
                  </div>
                ))}

              {!isExpanded &&
                call.conversation_details.transcript.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTranscriptExpansion(call.id)}
                    >
                      Show {call.conversation_details.transcript.length - 3}{" "}
                      more messages
                    </Button>
                  </div>
                )}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        {call.notes && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Notes:</strong> {call.notes}
            </p>
          </div>
        )}
      </div>
    );
  };

  const CallDetailModal = ({ call, isOpen, onClose }) => {
    if (!call) return null;

    const duration = call.twilio_details?.duration
      ? parseInt(call.twilio_details.duration)
      : 0;

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Call Details" size="xl">
        <div className="space-y-6">
          {/* Call Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {call.creator_name || "Unknown Creator"}
                </h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {call.phone_number}
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    {call.direction}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`px-3 py-1 text-sm font-medium rounded-full border ${getCallStatusColor(
                    call
                  )}`}
                >
                  {call.twilio_details?.status || "unknown"}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(call.twilio_details?.startTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Campaign Information */}
          {call.campaign_name && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Campaign Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Campaign:</span>
                  <span className="ml-2 font-medium">{call.campaign_name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-2 font-medium">
                    {call.campaign_type || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Brand:</span>
                  <span className="ml-2 font-medium">
                    {call.brand_name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium">
                    {call.campaign_status || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Call Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-blue-900">
                {formatDuration(duration)}
              </p>
              <p className="text-sm text-blue-600">Total Duration</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg text-center">
              <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-green-900">
                {call.conversation_details?.transcript?.length || 0}
              </p>
              <p className="text-sm text-green-600">Messages</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <Brain className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-lg font-semibold text-orange-900">
                {call.conversation_details?.analysis?.call_successful ===
                "failure"
                  ? "Failed"
                  : call.conversation_details?.analysis?.call_successful ===
                    "success"
                  ? "Success"
                  : "Partial"}
              </p>
              <p className="text-sm text-orange-600">AI Assessment</p>
            </div>
          </div>

          {/* Evaluation Criteria Results */}
          {call.conversation_details?.analysis?.evaluation_criteria_results && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Detailed Evaluation Results
              </h4>
              <div className="space-y-4">
                {Object.entries(
                  call.conversation_details.analysis.evaluation_criteria_results
                ).map(([criteria, result]) => (
                  <div
                    key={criteria}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">
                        {criteria.replace(/_/g, " ").toUpperCase()}
                      </h5>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          result.result === "success"
                            ? "bg-green-100 text-green-700"
                            : result.result === "failure"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {result.result}
                      </span>
                    </div>
                    {result.rationale && (
                      <p className="text-sm text-gray-600">
                        {result.rationale}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Conversation Transcript */}
          {call.conversation_details?.transcript && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Complete Conversation Transcript
              </h4>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {call.conversation_details.transcript.map((message, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      message.role === "agent"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-green-50 border-l-4 border-green-500"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">
                          {message.role === "agent"
                            ? "🤖 AI Agent"
                            : "👤 Creator"}
                        </span>
                        {message.interrupted && (
                          <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">
                            Interrupted
                          </span>
                        )}
                      </div>
                      {message.time_in_call_secs !== undefined && (
                        <span className="text-xs text-gray-500">
                          {formatDuration(message.time_in_call_secs)}
                        </span>
                      )}
                    </div>
                    {message.message && (
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {message.message}
                      </p>
                    )}
                    {message.llm_usage && (
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Model usage tracked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Technical Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Call SID:</span>
                <span className="ml-2 font-mono text-xs">{call.call_sid}</span>
              </div>
              <div>
                <span className="text-gray-600">Method:</span>
                <span className="ml-2 font-medium">{call.call_method}</span>
              </div>
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">{formatDateTime(call.created_at)}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis Summary */}
          {call.conversation_details?.analysis && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                AI Analysis Summary
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Call Successful:</span>
                  <span className="ml-2 font-medium">
                    {call.conversation_details.analysis.call_successful}
                  </span>
                </div>
                {call.conversation_details.analysis.transcript_summary && (
                  <div>
                    <span className="text-gray-600">Summary:</span>
                    <p className="mt-1 text-gray-800 leading-relaxed">
                      {call.conversation_details.analysis.transcript_summary}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <MessageSquare className="w-8 h-8 mr-3 text-primary-600" />
          Outreach Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your creator outreach campaigns, track calls, and monitor email
          communications
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("calls")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "calls"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <PhoneCall className="w-5 h-5 inline mr-2" />
              Calls ({filteredCalls.length})
            </button>
            <button
              onClick={() => setActiveTab("emails")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                activeTab === "emails"
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Mail className="w-5 h-5 inline mr-2" />
              Emails (Coming Soon)
            </button>
          </nav>
        </div>
      </div>

      {/* Calls Tab Content */}
      {activeTab === "calls" && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by creator name, phone, campaign, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="busy">Busy</option>
                  <option value="no-answer">No Answer</option>
                  <option value="in-progress">In Progress</option>
                </select>

                <select
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Directions</option>
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>

                <Button
                  variant="outline"
                  icon={RefreshCw}
                  onClick={fetchCalls}
                  loading={isLoading}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center animate-fade-in">
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

          {/* Calls List */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4"></div>
                <p className="text-gray-600">Loading calls...</p>
              </div>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-12">
              <PhoneCall className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {calls.length === 0 ? "No Calls Yet" : "No Calls Found"}
              </h3>
              <p className="text-gray-600 mb-6">
                {calls.length === 0
                  ? "Start making calls to creators to see them here"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {calls.length === 0 && (
                <Button variant="primary" href="/creators">
                  Find Creators to Call
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <p className="text-gray-600">
                  Showing {filteredCalls.length} of {calls.length} calls
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="duration">Duration</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>

              {/* Calls Grid */}
              <div className="space-y-4">
                {filteredCalls.map((call) => (
                  <CallCard key={call.id} call={call} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Emails Tab Content */}
      {activeTab === "emails" && (
        <div className="text-center py-12">
          <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Email Management Coming Soon
          </h3>
          <p className="text-gray-600">
            Track and manage your email outreach campaigns here
          </p>
        </div>
      )}

      {/* Call Detail Modal */}
      <CallDetailModal
        call={selectedCall}
        isOpen={showCallModal}
        onClose={() => {
          setShowCallModal(false);
          setSelectedCall(null);
        }}
      />
    </div>
  );
}
