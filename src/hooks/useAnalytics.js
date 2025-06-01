import { useState, useCallback } from "react";
import { analyticsApi } from "../services/api";
import { useApi } from "./useApi";

export const useAnalytics = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  const [campaignAnalytics, setCampaignAnalytics] = useState({});
  const [creatorAnalytics, setCreatorAnalytics] = useState({});
  const [audienceAnalytics, setAudienceAnalytics] = useState({});
  const [roiAnalytics, setROIAnalytics] = useState({});
  const api = useApi();

  // Fetch dashboard metrics
  const fetchDashboardMetrics = useCallback(async () => {
    return api.execute(async () => {
      const data = await analyticsApi.getDashboardMetrics();
      setDashboardMetrics(data);
      return data;
    });
  }, [api]);

  // Fetch campaign analytics
  const fetchCampaignAnalytics = useCallback(
    async (campaignId, dateRange = {}) => {
      return api.execute(async () => {
        const data = await analyticsApi.getCampaignAnalytics(
          campaignId,
          dateRange
        );
        setCampaignAnalytics(data);
        return data;
      });
    },
    [api]
  );

  // Fetch creator analytics
  const fetchCreatorAnalytics = useCallback(
    async (creatorId) => {
      return api.execute(async () => {
        const data = await analyticsApi.getCreatorAnalytics(creatorId);
        setCreatorAnalytics(data);
        return data;
      });
    },
    [api]
  );

  // Fetch audience analytics
  const fetchAudienceAnalytics = useCallback(
    async (campaignId) => {
      return api.execute(async () => {
        const data = await analyticsApi.getAudienceAnalytics(campaignId);
        setAudienceAnalytics(data);
        return data;
      });
    },
    [api]
  );

  // Fetch ROI analytics
  const fetchROIAnalytics = useCallback(
    async (campaignId) => {
      return api.execute(async () => {
        const data = await analyticsApi.getROIAnalytics(campaignId);
        setROIAnalytics(data);
        return data;
      });
    },
    [api]
  );

  return {
    dashboardMetrics,
    campaignAnalytics,
    creatorAnalytics,
    audienceAnalytics,
    roiAnalytics,
    loading: api.loading,
    error: api.error,
    fetchDashboardMetrics,
    fetchCampaignAnalytics,
    fetchCreatorAnalytics,
    fetchAudienceAnalytics,
    fetchROIAnalytics,
    reset: api.reset,
  };
};
