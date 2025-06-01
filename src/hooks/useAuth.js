import { useState, useEffect, useContext, createContext } from "react";
import { authApi } from "../services/api";
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  setRefreshToken,
} from "../services/storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = getToken();
      const savedUser = getUser();

      if (token && savedUser) {
        // Verify token is still valid
        const response = await authApi.verifyToken();
        if (response.type === "success") {
          setUserState(savedUser);
        } else {
          removeToken();
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (idToken, deviceInfo = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.googleLogin(idToken, deviceInfo);

      if (response.type === "success") {
        const { user: userData, tokens } = response.data;

        setToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
        setUser(userData);
        setUserState(userData);

        return { success: true, user: userData };
      } else {
        throw new Error(response.err || "Login failed");
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      removeToken();
      setUserState(null);
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authApi.getProfile();
      if (response.type === "success") {
        const updatedUser = response.data.user;
        setUser(updatedUser);
        setUserState(updatedUser);
        return updatedUser;
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isBrand: ["brand", "agency"].includes(user?.role),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
