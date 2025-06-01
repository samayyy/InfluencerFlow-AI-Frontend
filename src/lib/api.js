import axios from "axios";
import Cookies from "js-cookie";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3005/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

// Create and export singleton instance
const apiClient = new ApiClient();
export default apiClient;

// Export axios instance for direct use if needed
export { api };
