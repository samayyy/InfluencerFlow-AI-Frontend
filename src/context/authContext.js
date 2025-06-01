"use client";

import { createContext, useContext, useReducer, useEffect } from "react";
import apiClient, { apiUtils } from "../lib/api";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  tokens: null,
  hasBrand: false,
};

// Action types
const AUTH_ACTIONS = {
  AUTH_START: "AUTH_START",
  AUTH_SUCCESS: "AUTH_SUCCESS",
  AUTH_FAILURE: "AUTH_FAILURE",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  SET_LOADING: "SET_LOADING",
  SET_BRAND_STATUS: "SET_BRAND_STATUS",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        hasBrand: action.payload.hasBrand || false,
      };

    case AUTH_ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
        hasBrand: false,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      const updatedUser = { ...state.user, ...action.payload };
      return {
        ...state,
        user: updatedUser,
        hasBrand: !!(updatedUser?.brand_id && updatedUser?.brand_name),
      };

    case AUTH_ACTIONS.SET_BRAND_STATUS:
      return {
        ...state,
        hasBrand: action.payload,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = apiUtils.getAuthToken();
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      // Verify token and get user profile
      const response = await apiClient.auth.getProfile();
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const userData = result.data.user;

        // Check if user has brand profile
        let hasBrandProfile = false;
        if (userData.brand && userData.brand.id) {
          try {
            const brandResponse = await apiClient.brands.getProfile();
            const brandResult = apiUtils.handleResponse(brandResponse);
            hasBrandProfile = brandResult.success && brandResult.data?.brand;
          } catch (brandError) {
            console.log("Brand profile not found");
            hasBrandProfile = false;
          }
        }

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user: userData,
            tokens: { accessToken: token },
            hasBrand: hasBrandProfile,
          },
        });
      } else {
        // Token is invalid, clear auth data
        apiUtils.removeAuthToken();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      apiUtils.removeAuthToken();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    } finally {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Google OAuth login
  const loginWithGoogle = async (idToken, deviceInfo = {}) => {
    try {
      dispatch({ type: AUTH_ACTIONS.AUTH_START });

      const response = await apiClient.auth.googleLogin(idToken, deviceInfo);
      const result = apiUtils.handleResponse(response);

      if (result.success) {
        const { user, tokens, isNewUser } = result.data;

        // Check if user has brand profile
        let hasBrandProfile = false;
        if (user.brand_id) {
          try {
            const brandResponse = await apiClient.brands.getProfile();
            const brandResult = apiUtils.handleResponse(brandResponse);
            hasBrandProfile = brandResult.success && brandResult.data?.brand;
          } catch (brandError) {
            console.log("Brand profile not found");
            hasBrandProfile = false;
          }
        }

        // Store tokens and user data
        apiUtils.setAuthToken(tokens.accessToken);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        dispatch({
          type: AUTH_ACTIONS.AUTH_SUCCESS,
          payload: {
            user,
            tokens,
            hasBrand: hasBrandProfile,
          },
        });

        return { success: true, isNewUser, hasBrandProfile };
      } else {
        dispatch({
          type: AUTH_ACTIONS.AUTH_FAILURE,
          payload: result.error,
        });
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorResult = apiUtils.handleError(error);
      dispatch({
        type: AUTH_ACTIONS.AUTH_FAILURE,
        payload: errorResult.error,
      });
      return { success: false, error: errorResult.error };
    }
  };

  // Logout
  const logout = async (logoutAll = false) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        await apiClient.auth.logout(refreshToken, logoutAll);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state regardless of API call success
      apiUtils.removeAuthToken();

    //   redirect to home page


      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Set brand status
  const setBrandStatus = (hasBrand) => {
    dispatch({
      type: AUTH_ACTIONS.SET_BRAND_STATUS,
      payload: hasBrand,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    tokens: state.tokens,
    hasBrand: state.hasBrand,

    // Actions
    loginWithGoogle,
    logout,
    updateUser,
    clearError,
    setBrandStatus,

    // Utility functions
    hasBrandProfile: () => state.hasBrand,
    hasRole: (role) => state.user?.role === role,
    isAdmin: () => state.user?.role === "admin",
    isBrand: () => state.user?.role === "brand" || state.hasBrand,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
