export const API_ENDPOINTS = {
  // Auth
  AUTH_GOOGLE_LOGIN: "/auth/google/login",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_PROFILE: "/auth/profile",
  AUTH_VERIFY: "/auth/verify",

  // Brands
  BRANDS_CREATE: "/brands/create",
  BRANDS_PROFILE: "/brands/profile",
  BRANDS_BY_ID: (id) => `/brands/${id}`,
  BRANDS_UPDATE: (id) => `/brands/${id}`,
  BRANDS_ANALYZE_WEBSITE: "/brands/analyze-website",
  BRANDS_REGENERATE_AI: (id) => `/brands/${id}/regenerate-ai`,
  BRANDS_DELETE: (id) => `/brands/${id}`,
  BRANDS_ADMIN_ALL: "/brands/admin/all",
  BRANDS_ADMIN_VERIFICATION: (id) => `/brands/admin/${id}/verification`,
  BRANDS_ADMIN_STATS: "/brands/admin/stats",

  // Campaigns
  CAMPAIGNS_CREATE: "/campaigns/create",
  CAMPAIGNS_MY: "/campaigns/my-campaigns",
  CAMPAIGNS_BY_ID: (id) => `/campaigns/${id}`,
  CAMPAIGNS_UPDATE: (id) => `/campaigns/${id}`,
  CAMPAIGNS_DELETE: (id) => `/campaigns/${id}`,
  CAMPAIGNS_RECOMMENDATIONS: (id) => `/campaigns/${id}/recommendations`,
  CAMPAIGNS_REGENERATE_RECOMMENDATIONS: (id) =>
    `/campaigns/${id}/regenerate-recommendations`,
  CAMPAIGNS_PREVIEW_MATCH: "/campaigns/preview-influencer-match",
  CAMPAIGNS_STATS: "/campaigns/stats",
  CAMPAIGNS_BY_BRAND: (brandId) => `/campaigns/brand/${brandId}`,
  CAMPAIGNS_ADMIN_ALL: "/campaigns/admin/all",
  CAMPAIGNS_ADMIN_STATS: "/campaigns/admin/stats",

  // Creators
  CREATORS_ALL: "/creators/getAllCreators",
  CREATORS_BY_ID: (id) => `/creators/getCreatorById/${id}`,
  CREATORS_SEARCH: "/creators/searchCreators",
  CREATORS_GENERATE_AI: "/creators/generateAIEnhancedData",

  // Products
  PRODUCTS_CREATE: "/products/create",
  PRODUCTS_MY: "/products/my-products",
  PRODUCTS_BY_ID: (id) => `/products/${id}`,
  PRODUCTS_UPDATE: (id) => `/products/${id}`,
  PRODUCTS_DELETE: (id) => `/products/${id}`,
  PRODUCTS_BY_BRAND: (brandId) => `/products/brand/${brandId}`,
  PRODUCTS_SEARCH: "/products/search",
  PRODUCTS_ANALYZE_URL: "/products/analyze-url",
  PRODUCTS_REGENERATE_AI: (id) => `/products/${id}/regenerate-ai`,
  PRODUCTS_STATS: "/products/stats",
  PRODUCTS_ADMIN_ALL: "/products/admin/all",
  PRODUCTS_ADMIN_STATS: "/products/admin/stats",

  // Search
  SEARCH_AI: "/search/aiSearch",
  SEARCH_SUGGESTIONS: "/search/suggestions",
  SEARCH_ADVANCED: "/search/advanced",
  SEARCH_SIMILAR: (creatorId) => `/search/similar/${creatorId}`,
  SEARCH_HEALTH: "/search/health",
};

export const CAMPAIGN_TYPES = {
  SPONSORED_POST: "sponsored_post",
  BRAND_AMBASSADOR: "brand_ambassador",
  PRODUCT_REVIEW: "product_review",
  EVENT_COVERAGE: "event_coverage",
  CONTENT_COLLABORATION: "content_collaboration",
};

export const CAMPAIGN_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const CREATOR_TIERS = {
  MICRO: "micro",
  MACRO: "macro",
  MEGA: "mega",
};

export const CREATOR_NICHES = {
  TECH_GAMING: "tech_gaming",
  BEAUTY_FASHION: "beauty_fashion",
  LIFESTYLE_TRAVEL: "lifestyle_travel",
  FOOD_COOKING: "food_cooking",
  FITNESS_HEALTH: "fitness_health",
};

export const PLATFORMS = {
  YOUTUBE: "youtube",
  INSTAGRAM: "instagram",
  TIKTOK: "tiktok",
  TWITTER: "twitter",
};

export const USER_ROLES = {
  ADMIN: "admin",
  BRAND: "brand",
  AGENCY: "agency",
  CREATOR: "creator",
};

export const VERIFICATION_STATUSES = {
  UNVERIFIED: "unverified",
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
};
