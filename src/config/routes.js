export const ROUTES = {
  // Public Routes
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",

  // Protected Routes
  DASHBOARD: "/dashboard",

  // Brand Routes
  BRAND_PROFILE: "/brand/profile",
  BRAND_SETTINGS: "/brand/settings",
  BRAND_ANALYTICS: "/brand/analytics",

  // Campaign Routes
  CAMPAIGNS: "/campaigns",
  CAMPAIGNS_CREATE: "/campaigns/create",
  CAMPAIGNS_EDIT: "/campaigns/:id/edit",
  CAMPAIGNS_DETAILS: "/campaigns/:id",
  CAMPAIGNS_ANALYTICS: "/campaigns/:id/analytics",

  // Creator Routes
  CREATORS: "/creators",
  CREATORS_SEARCH: "/creators/search",
  CREATORS_PROFILE: "/creators/:id",
  CREATORS_COMPARISON: "/creators/comparison",
  CREATORS_SAVED: "/creators/saved",

  // Product Routes
  PRODUCTS: "/products",
  PRODUCTS_CREATE: "/products/create",
  PRODUCTS_EDIT: "/products/:id/edit",
  PRODUCTS_DETAILS: "/products/:id",

  // Analytics Routes
  ANALYTICS: "/analytics",
  ANALYTICS_CAMPAIGNS: "/analytics/campaigns",
  ANALYTICS_CREATORS: "/analytics/creators",
  ANALYTICS_AUDIENCE: "/analytics/audience",
  ANALYTICS_ROI: "/analytics/roi",

  // Communication Routes
  MESSAGES: "/messages",
  MESSAGES_THREAD: "/messages/:id",
  MESSAGES_BULK: "/messages/bulk",

  // Contract Routes
  CONTRACTS: "/contracts",
  CONTRACTS_CREATE: "/contracts/create",
  CONTRACTS_DETAILS: "/contracts/:id",

  // Payment Routes
  PAYMENTS: "/payments",
  PAYMENTS_HISTORY: "/payments/history",
  INVOICES: "/invoices",

  // Settings Routes
  SETTINGS: "/settings",
  SETTINGS_PROFILE: "/settings/profile",
  SETTINGS_NOTIFICATIONS: "/settings/notifications",
  SETTINGS_BILLING: "/settings/billing",
  SETTINGS_INTEGRATIONS: "/settings/integrations",

  // Admin Routes
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_BRANDS: "/admin/brands",
  ADMIN_CAMPAIGNS: "/admin/campaigns",
  ADMIN_SYSTEM: "/admin/system",
  ADMIN_ANALYTICS: "/admin/analytics",

  // Error Routes
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  SERVER_ERROR: "/500",
};
