import { useState, useEffect, useCallback } from "react";
import { brandsApi } from "../services/api";
import { useApi } from "./useApi";

export const useBrands = () => {
  const [brand, setBrand] = useState(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const api = useApi();

  // Fetch brand profile
  const fetchBrandProfile = useCallback(async () => {
    return api.execute(async () => {
      const response = await brandsApi.getProfile();
      if (response.type === "success") {
        setBrand(response.data.brand);
        setHasCompletedOnboarding(true);
        return response.data;
      } else if (response.type === "no_records_found") {
        setBrand(null);
        setHasCompletedOnboarding(false);
        return null;
      }
      throw new Error(response.err || "Failed to fetch brand profile");
    });
  }, [api]);

  // Create brand
  const createBrand = useCallback(
    async (brandData) => {
      return api.execute(async () => {
        const response = await brandsApi.create(brandData);
        if (response.type === "success") {
          setBrand(response.data.brand);
          setHasCompletedOnboarding(true);
          return response.data;
        }
        throw new Error(response.err || "Failed to create brand");
      });
    },
    [api]
  );

  // Update brand
  const updateBrand = useCallback(
    async (brandId, updateData) => {
      return api.execute(async () => {
        const response = await brandsApi.update(brandId, updateData);
        if (response.type === "success") {
          setBrand(response.data.brand);
          return response.data;
        }
        throw new Error(response.err || "Failed to update brand");
      });
    },
    [api]
  );

  // Analyze website
  const analyzeWebsite = useCallback(
    async (websiteUrl, brandName) => {
      return api.execute(async () => {
        const response = await brandsApi.analyzeWebsite(websiteUrl, brandName);
        if (response.type === "success") {
          return response.data;
        }
        throw new Error(response.err || "Website analysis failed");
      });
    },
    [api]
  );

  // Regenerate AI overview
  const regenerateAI = useCallback(
    async (brandId) => {
      return api.execute(async () => {
        const response = await brandsApi.regenerateAI(brandId);
        if (response.type === "success") {
          // Update brand with new AI overview
          setBrand((prev) =>
            prev ? { ...prev, ...response.data.brand } : null
          );
          return response.data;
        }
        throw new Error(response.err || "Failed to regenerate AI overview");
      });
    },
    [api]
  );

  // Auto-fetch brand profile on mount
  useEffect(() => {
    fetchBrandProfile();
  }, [fetchBrandProfile]);

  return {
    brand,
    hasCompletedOnboarding,
    loading: api.loading,
    error: api.error,
    fetchBrandProfile,
    createBrand,
    updateBrand,
    analyzeWebsite,
    regenerateAI,
    reset: api.reset,
  };
};
