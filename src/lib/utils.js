import { format, formatDistanceToNow, parseISO } from 'date-fns'

// Utility functions for the application

// Format numbers with commas
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Format percentage
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`
}

// Truncate text
export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Convert string to title case
export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Date formatting utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date, formatStr = 'MMM dd, yyyy') => {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, formatStr)
  },

  // Format date with time
  formatDateTime: (date) => {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return format(parsedDate, 'MMM dd, yyyy HH:mm')
  },

  // Format relative time
  formatRelativeTime: (date) => {
    if (!date) return ''
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(parsedDate, { addSuffix: true })
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date()
    const parsedDate = typeof date === 'string' ? parseISO(date) : date
    return (
      parsedDate.getDate() === today.getDate() &&
      parsedDate.getMonth() === today.getMonth() &&
      parsedDate.getFullYear() === today.getFullYear()
    )
  },
}

// Array utilities
export const arrayUtils = {
  // Remove duplicates from array
  unique: (arr) => [...new Set(arr)],

  // Group array by key
  groupBy: (arr, key) => {
    return arr.reduce((groups, item) => {
      const group = item[key]
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {})
  },

  // Sort array by key
  sortBy: (arr, key, direction = 'asc') => {
    return [...arr].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  },

  // Chunk array into smaller arrays
  chunk: (arr, size) => {
    const chunks = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  },
}

// Object utilities
export const objectUtils = {
  // Deep clone object
  deepClone: (obj) => JSON.parse(JSON.stringify(obj)),

  // Check if object is empty
  isEmpty: (obj) => Object.keys(obj).length === 0,

  // Pick specific keys from object
  pick: (obj, keys) => {
    return keys.reduce((picked, key) => {
      if (key in obj) {
        picked[key] = obj[key]
      }
      return picked
    }, {})
  },

  // Omit specific keys from object
  omit: (obj, keys) => {
    const omitted = { ...obj }
    keys.forEach(key => delete omitted[key])
    return omitted
  },
}

// URL utilities
export const urlUtils = {
  // Get query parameters as object
  getQueryParams: () => {
    if (typeof window === 'undefined') return {}
    
    const params = new URLSearchParams(window.location.search)
    const result = {}
    
    for (const [key, value] of params.entries()) {
      result[key] = value
    }
    
    return result
  },

  // Build URL with query parameters
  buildUrl: (baseUrl, params) => {
    const url = new URL(baseUrl)
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key])
      }
    })
    return url.toString()
  },

  // Validate URL
  isValidUrl: (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  },
}

// Local storage utilities
export const storageUtils = {
  // Set item in localStorage with expiry
  setItem: (key, value, expiryInMinutes = null) => {
    if (typeof window === 'undefined') return

    const item = {
      value,
      expiry: expiryInMinutes ? Date.now() + (expiryInMinutes * 60 * 1000) : null
    }
    
    localStorage.setItem(key, JSON.stringify(item))
  },

  // Get item from localStorage
  getItem: (key) => {
    if (typeof window === 'undefined') return null

    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null

      const item = JSON.parse(itemStr)
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key)
        return null
      }
      
      return item.value
    } catch (error) {
      console.error('Error getting item from localStorage:', error)
      return null
    }
  },

  // Remove item from localStorage
  removeItem: (key) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },

  // Clear all localStorage
  clear: () => {
    if (typeof window === 'undefined') return
    localStorage.clear()
  },
}

// Form validation utilities
export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Phone validation
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  },

  // URL validation
  isValidWebsite: (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  },

  // Password strength validation
  getPasswordStrength: (password) => {
    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
    }

    Object.values(checks).forEach(check => {
      if (check) score++
    })

    if (score < 3) return { strength: 'weak', score, checks }
    if (score < 5) return { strength: 'medium', score, checks }
    return { strength: 'strong', score, checks }
  },
}

// Color utilities
export const colorUtils = {
  // Generate random color
  randomColor: () => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ]
    return colors[Math.floor(Math.random() * colors.length)]
  },

  // Convert hex to RGB
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },

  // Get contrast color (black or white) for background
  getContrastColor: (hex) => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return '#000000'
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  },
}

// File utilities
export const fileUtils = {
  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Get file extension
  getFileExtension: (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  },

  // Check if file is image
  isImage: (filename) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
    const extension = fileUtils.getFileExtension(filename).toLowerCase()
    return imageExtensions.includes(extension)
  },
}

// Creator utilities specific to the app
export const creatorUtils = {
  // Get creator tier based on followers
  getCreatorTier: (followers) => {
    if (followers < 10000) return 'nano'
    if (followers < 100000) return 'micro'
    if (followers < 1000000) return 'macro'
    return 'mega'
  },

  // Get tier display name
  getTierDisplayName: (tier) => {
    const tierNames = {
      nano: 'Nano Influencer',
      micro: 'Micro Influencer',
      macro: 'Macro Influencer',
      mega: 'Mega Influencer'
    }
    return tierNames[tier] || tier
  },

  // Calculate engagement rate
  calculateEngagementRate: (likes, comments, shares = 0, followers) => {
    if (followers === 0) return 0
    const totalEngagement = likes + comments + shares
    return (totalEngagement / followers) * 100
  },

  // Get engagement rate status
  getEngagementStatus: (rate) => {
    if (rate >= 6) return { status: 'excellent', color: 'green' }
    if (rate >= 3) return { status: 'good', color: 'blue' }
    if (rate >= 1) return { status: 'average', color: 'yellow' }
    return { status: 'low', color: 'red' }
  },
}

// Campaign utilities
export const campaignUtils = {
  // Get campaign status color
  getStatusColor: (status) => {
    const colors = {
      draft: 'gray',
      active: 'blue',
      paused: 'yellow',
      completed: 'green',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  },

  // Calculate campaign progress
  calculateProgress: (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    
    if (now < start) return 0
    if (now > end) return 100
    
    const total = end.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    return Math.round((elapsed / total) * 100)
  },

  // Get campaign type display name
  getTypeDisplayName: (type) => {
    const typeNames = {
      sponsored_post: 'Sponsored Post',
      brand_ambassador: 'Brand Ambassador',
      product_review: 'Product Review',
      giveaway: 'Giveaway',
      event_promotion: 'Event Promotion'
    }
    return typeNames[type] || type
  },
}

// Error handling utilities
export const errorUtils = {
  // Get user-friendly error message
  getErrorMessage: (error) => {
    if (typeof error === 'string') return error
    
    if (error?.message) return error.message
    if (error?.error) return error.error
    if (error?.msg) return error.msg
    
    return 'An unexpected error occurred'
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('Network') ||
           error?.message?.includes('network')
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error?.status === 401 || 
           error?.code === 401 ||
           error?.message?.includes('Unauthorized')
  },
}

export default {
  formatNumber,
  formatCurrency,
  formatPercentage,
  truncateText,
  capitalize,
  toTitleCase,
  generateId,
  debounce,
  throttle,
  dateUtils,
  arrayUtils,
  objectUtils,
  urlUtils,
  storageUtils,
  validationUtils,
  colorUtils,
  fileUtils,
  creatorUtils,
  campaignUtils,
  errorUtils,
}