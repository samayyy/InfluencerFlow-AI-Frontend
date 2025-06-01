import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining class names
export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// Format currency
export const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Format numbers with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Format engagement rate
export const formatEngagementRate = (rate) => {
  return `${(rate || 0).toFixed(1)}%`;
};

// Calculate engagement rate
export const calculateEngagementRate = (likes, comments, shares, followers) => {
  if (!followers || followers === 0) return 0;
  const totalEngagements = (likes || 0) + (comments || 0) + (shares || 0);
  return (totalEngagements / followers) * 100;
};

// Format date
export const formatDate = (date, format = "MMM dd, yyyy") => {
  return format(new Date(date), format);
};

// Get relative time
export const getRelativeTime = (date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Generate initials from name
export const getInitials = (name) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
