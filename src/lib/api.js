import axios from "axios";
import Cookies from "js-cookie";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken") || Cookies.get("accessToken");
  }
  return null;
};

const setAuthToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", token);
    Cookies.set("accessToken", token, { expires: 1 }); // 1 day
  }
};

const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (response.data.code === 2000) {
            const { accessToken } = response.data.data;
            setAuthToken(accessToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        removeAuthToken();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

// API Client Class
class ApiClient {
  // Authentication APIs
  auth = {
    googleLogin: (idToken, deviceInfo) =>
      api.post("/auth/google/login", { idToken, deviceInfo }),

    refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),

    logout: (refreshToken, logoutAll = false) =>
      api.post("/auth/logout", { refreshToken, logoutAll }),

    getProfile: () => api.get("/auth/profile"),

    getSessions: () => api.get("/auth/sessions"),

    revokeSession: (sessionId) => api.delete(`/auth/sessions/${sessionId}`),

    verifyToken: () => api.post("/auth/verify"),
  };

  // Health Check APIs
  health = {
    ping: () => api.get("/healthCheck/getPing"),
    postPing: (name) => api.post("/healthCheck/postPing", { name }),
  };

  // Creator Management APIs
  creators = {
    getAll: (params) => api.get("/creators/getAllCreators", { params }),
    getById: (id) => api.get(`/creators/getCreatorById/${id}`),
    search: (params) => api.get("/creators/searchCreators", { params }),
    generateMockData: (count = 500) =>
      api.post("/creators/generateMockData", {}, { params: { count } }),
    generateAIEnhancedData: (params) =>
      api.post("/creators/generateAIEnhancedData", {}, { params }),
    testProfilePics: (count = 10) =>
      api.get("/creators/testProfilePics", { params: { count } }),
  };

  // AI Search APIs
  search = {
    aiSearch: (query, filters, options) =>
      api.post("/search/aiSearch", { query, filters, ...options }),

    getSuggestions: (params) => api.get("/search/suggestions", { params }),

    advancedSearch: (searchCriteria) =>
      api.post("/search/advanced", searchCriteria),

    findSimilar: (creatorId, params) =>
      api.get(`/search/similar/${creatorId}`, { params }),

    healthCheck: () => api.get("/search/health"),

    // Admin APIs
    admin: {
      initialize: (config) => api.post("/search/admin/initialize", config),
      updateEmbedding: (creatorId) =>
        api.put(`/search/admin/embedding/${creatorId}`),
      deleteEmbedding: (creatorId) =>
        api.delete(`/search/admin/embedding/${creatorId}`),
      getStats: () => api.get("/search/admin/stats"),
      bulkEmbed: (creator_ids) =>
        api.post("/search/admin/bulk-embed", { creator_ids }),
      rebuildIndex: (confirm_rebuild, backup_name) =>
        api.post("/search/admin/rebuild-index", {
          confirm_rebuild,
          backup_name,
        }),
      debug: () => api.get("/search/admin/debug"),
      testSimilarity: (query) =>
        api.get(`/search/admin/test-similarity/${query}`),
    },
  };

  // Search Analytics APIs
  analytics = {
    search: {
      getAnalytics: (params) => api.get("/analytics/search", { params }),
      getRealTimeStats: () => api.get("/analytics/search/realtime"),
      getPerformanceReport: (params) =>
        api.get("/analytics/search/report", { params }),
      logInteraction: (interaction) =>
        api.post("/analytics/search/interaction", interaction),
      getTrends: (params) => api.get("/analytics/search/trends", { params }),
    },
  };

  // Brand Management APIs
  brands = {
    create: (brandData) => api.post("/brands/create", brandData),
    getProfile: () => api.get("/brands/profile"),
    getById: (brandId) => api.get(`/brands/${brandId}`),
    update: (brandId, brandData) => api.put(`/brands/${brandId}`, brandData),
    delete: (brandId) => api.delete(`/brands/${brandId}`),
    analyzeWebsite: (website_url, brand_name) =>
      api.post("/brands/analyze-website", { website_url, brand_name }),
    regenerateAI: (brandId) => api.post(`/brands/${brandId}/regenerate-ai`),

    // Admin APIs
    admin: {
      getAll: (params) => api.get("/brands/admin/all", { params }),
      updateVerification: (brandId, status) =>
        api.put(`/brands/admin/${brandId}/verification`, { status }),
      getStats: () => api.get("/brands/admin/stats"),
    },
  };

  // Product Management APIs
  products = {
    create: (productData) => api.post("/products/create", productData),
    getById: (productId) => api.get(`/products/${productId}`),
    getMy: (params) => api.get("/products/my-products", { params }),
    getByBrand: (brandId, params) =>
      api.get(`/products/brand/${brandId}`, { params }),
    update: (productId, productData) =>
      api.put(`/products/${productId}`, productData),
    delete: (productId) => api.delete(`/products/${productId}`),
    analyzeUrl: (productData) => api.post("/products/analyze-url", productData),
    regenerateOverview: (productId) =>
      api.post(`/products/${productId}/regenerate-ai`),
    search: (params) => api.get("/products/search", { params }),
    getStats: () => api.get("/products/stats"),

    // Admin APIs
    admin: {
      getAll: (params) => api.get("/products/admin/all", { params }),
      getStats: () => api.get("/products/admin/stats"),
    },
  };

  // Campaign Management APIs
  campaigns = {
    create: (campaignData) => api.post("/campaigns/create", campaignData),
    getById: (campaignId) => api.get(`/campaigns/${campaignId}`),
    getMy: (params) => api.get("/campaigns/my-campaigns", { params }),
    getByBrand: (brandId, params) =>
      api.get(`/campaigns/brand/${brandId}`, { params }),
    update: (campaignId, campaignData) =>
      api.put(`/campaigns/${campaignId}`, campaignData),
    delete: (campaignId) => api.delete(`/campaigns/${campaignId}`),
    getRecommendations: (campaignId, params) =>
      api.get(`/campaigns/${campaignId}/recommendations`, { params }),
    regenerateRecommendations: (campaignId) =>
      api.post(`/campaigns/${campaignId}/regenerate-recommendations`),
    previewInfluencerMatch: (previewData) =>
      api.post("/campaigns/preview-influencer-match", previewData),
    getStats: () => api.get("/campaigns/stats"),
    enhanced: {
      // Create campaign from form with integrated product analysis
      createFromForm: (campaignData) =>
        api.post("/campaigns/enhanced/create-form", campaignData),

      // Create campaign from uploaded document
      createFromDocument: (documentFile, additionalData = {}) => {
        const formData = new FormData();
        formData.append("campaign_document", documentFile);

        // Add any additional data
        Object.keys(additionalData).forEach((key) => {
          formData.append(key, additionalData[key]);
        });

        return api.post("/campaigns/enhanced/create-document", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      },

      // Create campaign from NLP query
      createFromQuery: (queryText) =>
        api.post("/campaigns/enhanced/create-query", { query_text: queryText }),

      // Preview AI analysis without creating campaign
      previewAnalysis: (analysisData) =>
        api.post("/campaigns/enhanced/preview-analysis", analysisData),

      // Get full AI analysis for existing campaign
      getFullAnalysis: (campaignId) =>
        api.get(`/campaigns/enhanced/${campaignId}/full-analysis`),

      // Regenerate AI analysis for existing campaign
      regenerateAnalysis: (campaignId) =>
        api.post(`/campaigns/enhanced/${campaignId}/regenerate-analysis`),

      // Helper methods for different preview types
      previewFromForm: (formData) =>
        api.post("/campaigns/enhanced/preview-analysis", {
          analysis_type: "form",
          campaign_data: formData,
        }),

      previewFromQuery: (queryText) =>
        api.post("/campaigns/enhanced/preview-analysis", {
          analysis_type: "query",
          query_text: queryText,
        }),

      previewFromUrl: (productUrl) =>
        api.post("/campaigns/enhanced/preview-analysis", {
          analysis_type: "url_only",
          product_url: productUrl,
        }),
    },

    // Admin APIs
    admin: {
      getAll: (params) => api.get("/campaigns/admin/all", { params }),
      getStats: () => api.get("/campaigns/admin/stats"),
    },
  };

  // Calling APIs (Twilio & ElevenLabs)
  calling = {
    initiate: (callData) => api.post("/calling/initiate", callData),
    getCallDetails: (callId) => api.get(`/calling/calls/${callId}`),
    getAllCalls: (params) => api.get("/calling/calls", { params }),
    terminate: (callId) => api.post(`/calling/calls/${callId}/terminate`),
    getRecordings: (callId) => api.get(`/calling/calls/${callId}/recordings`),
    getAnalytics: (params) => api.get("/calling/analytics", { params }),
    getInsights: (callId) => api.get(`/calling/calls/${callId}/insights`),
    healthCheck: () => api.get("/calling/health"),
    getAgents: () => api.get("/calling/agents"),
    testSetup: (testData) => api.post("/calling/test", testData),
  };

  // Razorpay Payout APIs
  payout = {
    createContact: (contactData) =>
      api.post("/payout/createContact", contactData),
    createFundAccount: (accountData) =>
      api.post("/payout/createFundAccount", accountData),
    createPayout: (payoutData) => api.post("/payout/createPayout", payoutData),
    getContact: (contactId) => api.get(`/payout/getContact/${contactId}`),
    getPayout: (payoutId) => api.get(`/payout/getPayout/${payoutId}`),
    getBalance: () => api.get("/payout/getBalance"),

    // Mock APIs
    addFunds: (amount) => api.post("/payout/addFunds", { amount }),
    getStats: () => api.get("/payout/getStats"),
    resetMockData: () => api.post("/payout/resetMockData"),
  };

  // Email APIs
  mail = {
    sendBrandCollab: (creatorIds, brandName) =>
      api.post("/mail/sendBrandCollab", { creatorIds, brandName }),
  };
}

// Utility functions
export const apiUtils = {
  setAuthToken,
  removeAuthToken,
  getAuthToken,

  // Handle API responses
  handleResponse: (response) => {
    if (response.data.code === 2000) {
      return { success: true, data: response.data.data };
    } else {
      return {
        success: false,
        error: response.data.error || response.data.msg || "An error occurred",
        code: response.data.code,
      };
    }
  },

  // Handle API errors
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { data, status } = error.response;
      return {
        success: false,
        error: data?.error || data?.msg || `HTTP ${status} Error`,
        code: data?.code || status,
        status,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: "Network error - please check your connection",
        code: "NETWORK_ERROR",
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || "An unexpected error occurred",
        code: "UNKNOWN_ERROR",
      };
    }
  },

  // Format API URL
  formatUrl: (endpoint) => `${API_BASE_URL}${endpoint}`,
};

export const enhancedCampaignUtils = {
  // Validate campaign creation data
  validateCampaignData: (campaignData, creationType = "form") => {
    const errors = [];

    if (creationType === "form") {
      if (!campaignData.campaign_name?.trim()) {
        errors.push("Campaign name is required");
      }
      if (!campaignData.campaign_type) {
        errors.push("Campaign type is required");
      }
    } else if (creationType === "query") {
      if (!campaignData.query_text?.trim()) {
        errors.push("Query text is required");
      }
      if (campaignData.query_text && campaignData.query_text.length < 50) {
        errors.push("Query text must be at least 50 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Format campaign data for API submission
  formatCampaignForSubmission: (formData) => {
    return {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      product_price: formData.product_price
        ? parseFloat(formData.product_price)
        : undefined,
      hashtags: formData.hashtags
        ? formData.hashtags.split(",").map((h) => h.trim().replace(/^#/, ""))
        : undefined,
      target_audience: Object.keys(formData.target_audience || {}).some(
        (key) => formData.target_audience[key]
      )
        ? formData.target_audience
        : undefined,
    };
  },

  // Extract key insights from AI analysis
  extractAnalysisInsights: (aiAnalysis) => {
    const insights = {
      confidence: 0,
      keyFindings: [],
      recommendations: [],
      warnings: [],
    };

    if (aiAnalysis?.extracted_data?.extraction_metadata) {
      insights.confidence =
        aiAnalysis.extracted_data.extraction_metadata.confidence_score || 0;
    }

    if (aiAnalysis?.campaign_analysis?.campaign_intelligence) {
      const intelligence = aiAnalysis.campaign_analysis.campaign_intelligence;
      insights.keyFindings = [
        intelligence.campaign_strategy,
        ...(intelligence.success_metrics?.slice(0, 3) || []),
      ];
    }

    if (aiAnalysis?.website_analysis?.brand_analysis) {
      const brandAnalysis = aiAnalysis.website_analysis.brand_analysis;
      insights.recommendations = [
        brandAnalysis.influencer_collaboration_fit?.collaboration_goals?.[0],
        ...(brandAnalysis.influencer_collaboration_fit?.ideal_creator_types?.slice(
          0,
          2
        ) || []),
      ].filter(Boolean);
    }

    if (
      aiAnalysis?.extracted_data?.extraction_metadata?.missing_fields?.length >
      0
    ) {
      insights.warnings.push(
        `Missing ${aiAnalysis.extracted_data.extraction_metadata.missing_fields.length} fields - AI generated defaults`
      );
    }

    return insights;
  },

  // Calculate campaign completeness score
  calculateCompleteness: (campaignData, aiAnalysis = null) => {
    const requiredFields = [
      "campaign_name",
      "campaign_type",
      "description",
      "objectives",
      "budget",
      "target_audience",
      "content_guidelines",
    ];

    const presentFields = requiredFields.filter((field) => {
      if (field === "target_audience") {
        return (
          campaignData[field] && Object.keys(campaignData[field]).length > 0
        );
      }
      return campaignData[field]?.toString().trim();
    });

    let baseScore = (presentFields.length / requiredFields.length) * 70;

    // Bonus points for AI enhancements
    if (aiAnalysis?.website_analysis) baseScore += 15;
    if (aiAnalysis?.campaign_analysis) baseScore += 10;
    if (aiAnalysis?.influencer_recommendations?.recommendations?.length > 0)
      baseScore += 5;

    return Math.min(Math.round(baseScore), 100);
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Validate file for document upload
  validateDocumentFile: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const errors = [];

    if (!file) {
      errors.push("No file selected");
      return { isValid: false, errors };
    }

    if (file.size > maxSize) {
      errors.push("File size must be less than 10MB");
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push("File must be PDF, DOC, DOCX, or TXT format");
    }

    return {
      isValid: errors.length === 0,
      errors,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type,
        formattedSize: enhancedCampaignUtils.formatFileSize(file.size),
      },
    };
  },

  // Parse campaign type to human readable
  formatCampaignType: (type) => {
    const typeMap = {
      sponsored_post: "Sponsored Post",
      brand_ambassador: "Brand Ambassador",
      product_review: "Product Review",
      event_coverage: "Event Coverage",
      content_collaboration: "Content Collaboration",
      giveaway: "Giveaway",
    };

    return (
      typeMap[type] ||
      type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
    );
  },

  // Generate campaign summary from data
  generateCampaignSummary: (campaignData, aiAnalysis = null) => {
    const summary = {
      title: campaignData.campaign_name || "Untitled Campaign",
      type: enhancedCampaignUtils.formatCampaignType(
        campaignData.campaign_type
      ),
      budget: campaignData.budget
        ? `${
            campaignData.currency || "USD"
          } ${campaignData.budget.toLocaleString()}`
        : "Budget not set",
      timeline: "Timeline not set",
      targetAudience: "Not specified",
      aiEnhanced: false,
      confidence: 0,
    };

    // Timeline
    if (campaignData.start_date && campaignData.end_date) {
      const start = new Date(campaignData.start_date).toLocaleDateString();
      const end = new Date(campaignData.end_date).toLocaleDateString();
      summary.timeline = `${start} - ${end}`;
    } else if (campaignData.event_date) {
      summary.timeline = `Event: ${new Date(
        campaignData.event_date
      ).toLocaleDateString()}`;
    }

    // Target audience
    if (campaignData.target_audience?.demographics) {
      summary.targetAudience = campaignData.target_audience.demographics;
    } else if (
      aiAnalysis?.campaign_analysis?.target_audience_analysis?.audience_persona
    ) {
      summary.targetAudience =
        aiAnalysis.campaign_analysis.target_audience_analysis.audience_persona;
    }

    // AI enhancement info
    if (aiAnalysis) {
      summary.aiEnhanced = true;
      summary.confidence =
        aiAnalysis.extracted_data?.extraction_metadata?.confidence_score || 0;
    }

    return summary;
  },

  // Helper to check if campaign needs more information
  identifyMissingInfo: (campaignData) => {
    const missing = [];

    if (!campaignData.description?.trim()) missing.push("Campaign description");
    if (!campaignData.objectives?.trim()) missing.push("Campaign objectives");
    if (!campaignData.budget) missing.push("Budget");
    if (
      !campaignData.target_audience ||
      Object.keys(campaignData.target_audience).length === 0
    ) {
      missing.push("Target audience");
    }
    if (!campaignData.content_guidelines?.trim())
      missing.push("Content guidelines");
    if (!campaignData.start_date) missing.push("Start date");
    if (!campaignData.end_date && !campaignData.event_date)
      missing.push("End date or event date");

    return missing;
  },

  // Generate recommendations based on campaign type
  generateTypeSpecificRecommendations: (campaignType) => {
    const recommendations = {
      sponsored_post: [
        "Include clear CTA in content guidelines",
        "Specify brand mention requirements",
        "Consider story + feed post combination",
      ],
      brand_ambassador: [
        "Plan for long-term relationship",
        "Create exclusive discount codes",
        "Establish regular content calendar",
      ],
      product_review: [
        "Allow sufficient time for product testing",
        "Encourage honest, detailed feedback",
        "Provide product information packet",
      ],
      event_coverage: [
        "Confirm attendance requirements",
        "Plan live coverage schedule",
        "Prepare event-specific hashtags",
      ],
      content_collaboration: [
        "Define creative freedom boundaries",
        "Plan collaborative ideation session",
        "Establish revision process",
      ],
      giveaway: [
        "Ensure compliance with platform rules",
        "Plan winner selection process",
        "Create clear entry requirements",
      ],
    };

    return recommendations[campaignType] || [];
  },
};

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export axios instance for direct use if needed
export { api };
