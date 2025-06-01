import { useState, useEffect, useCallback } from "react";
import { campaignsApi } from "../services/api";
import { useApi } from "./useApi";

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [currentCampaign, setCurrentCampaign] = useState(null);
  const [stats, setStats] = useState({});
  const api = useApi();

  // Fetch all campaigns
  const fetchCampaigns = useCallback(
    async (pagination = {}) => {
      return api.execute(async () => {
        const response = await campaignsApi.getMyCampaigns(pagination);
        if (response.type === "success") {
          setCampaigns(response.data.campaigns || []);
          return response.data;
        }
        throw new Error(response.err || "Failed to fetch campaigns");
      });
    },
    [api]
  );

  // Create campaign
  const createCampaign = useCallback(
    async (campaignData) => {
      return api.execute(async () => {
        const response = await campaignsApi.create(campaignData);
        if (response.type === "success") {
          // Add to campaigns list
          setCampaigns((prev) => [response.data.campaign, ...prev]);
          return response.data;
        }
        throw new Error(response.err || "Failed to create campaign");
      });
    },
    [api]
  );

  // Update campaign
  const updateCampaign = useCallback(
    async (campaignId, updateData) => {
      return api.execute(async () => {
        const response = await campaignsApi.update(campaignId, updateData);
        if (response.type === "success") {
          // Update in campaigns list
          setCampaigns((prev) =>
            prev.map((campaign) =>
              campaign.id === campaignId
                ? { ...campaign, ...response.data.campaign }
                : campaign
            )
          );

          // Update current campaign if it's the same
          if (currentCampaign?.id === campaignId) {
            setCurrentCampaign(response.data.campaign);
          }

          return response.data;
        }
        throw new Error(response.err || "Failed to update campaign");
      });
    },
    [api, currentCampaign]
  );

  // Delete campaign
  const deleteCampaign = useCallback(
    async (campaignId) => {
      return api.execute(async () => {
        const response = await campaignsApi.delete(campaignId);
        if (response.type === "success") {
          // Remove from campaigns list
          setCampaigns((prev) =>
            prev.filter((campaign) => campaign.id !== campaignId)
          );

          // Clear current campaign if it's the deleted one
          if (currentCampaign?.id === campaignId) {
            setCurrentCampaign(null);
          }

          return response.data;
        }
        throw new Error(response.err || "Failed to delete campaign");
      });
    },
    [api, currentCampaign]
  );

  // Get campaign by ID
  const getCampaign = useCallback(
    async (campaignId) => {
      return api.execute(async () => {
        const response = await campaignsApi.getById(campaignId);
        if (response.type === "success") {
          setCurrentCampaign(response.data.campaign);
          return response.data;
        }
        throw new Error(response.err || "Failed to fetch campaign");
      });
    },
    [api]
  );

  // Get campaign recommendations
  const getRecommendations = useCallback(
    async (campaignId, options = {}) => {
      return api.execute(async () => {
        const response = await campaignsApi.getRecommendations(
          campaignId,
          options
        );
        if (response.type === "success") {
          return response.data;
        }
        throw new Error(response.err || "Failed to fetch recommendations");
      });
    },
    [api]
  );

  // Regenerate recommendations
  const regenerateRecommendations = useCallback(
    async (campaignId) => {
      return api.execute(async () => {
        const response =
          await campaignsApi.regenerateRecommendations(campaignId);
        if (response.type === "success") {
          return response.data;
        }
        throw new Error(response.err || "Failed to regenerate recommendations");
      });
    },
    [api]
  );

  // Fetch campaign stats
  const fetchStats = useCallback(async () => {
    return api.execute(async () => {
      const response = await campaignsApi.getStats();
      if (response.type === "success") {
        setStats(response.data.statistics || {});
        return response.data;
      }
      throw new Error(response.err || "Failed to fetch stats");
    });
  }, [api]);

  // Auto-fetch campaigns on mount
  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns, fetchStats]);

  return {
    campaigns,
    currentCampaign,
    stats,
    loading: api.loading,
    error: api.error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    getCampaign,
    getRecommendations,
    regenerateRecommendations,
    fetchStats,
    reset: api.reset,
  };
};
