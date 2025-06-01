import { useState, useCallback } from "react";
import { creatorsApi, searchApi } from "../services/api";
import { useApi } from "./useApi";

export const useCreators = () => {
  const [creators, setCreators] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentCreator, setCurrentCreator] = useState(null);
  const [searchMetadata, setSearchMetadata] = useState(null);
  const api = useApi();

  // Search creators with AI
  const searchCreators = useCallback(
    async (query, options = {}) => {
      return api.execute(async () => {
        const response = await searchApi.aiSearch(query, options);
        if (response.type === "success") {
          setSearchResults(response.data.results || []);
          setSearchMetadata(response.data.metadata || {});
          return response.data;
        }
        throw new Error(response.err || "Search failed");
      });
    },
    [api]
  );

  // Get all creators
  const fetchCreators = useCallback(
    async (filters = {}, pagination = {}) => {
      return api.execute(async () => {
        const response = await creatorsApi.getAll(filters, pagination);
        if (response.type === "success") {
          setCreators(response.data.creators || []);
          return response.data;
        }
        throw new Error(response.err || "Failed to fetch creators");
      });
    },
    [api]
  );

  // Get creator by ID
  const getCreator = useCallback(
    async (creatorId) => {
      return api.execute(async () => {
        const response = await creatorsApi.getById(creatorId);
        if (response.type === "success") {
          setCurrentCreator(response.data);
          return response.data;
        }
        throw new Error(response.err || "Failed to fetch creator");
      });
    },
    [api]
  );

  // Find similar creators
  const findSimilarCreators = useCallback(
    async (creatorId, options = {}) => {
      return api.execute(async () => {
        const response = await searchApi.findSimilar(creatorId, options);
        if (response.type === "success") {
          return response.data;
        }
        throw new Error(response.err || "Failed to find similar creators");
      });
    },
    [api]
  );

  // Get search suggestions
  const getSearchSuggestions = useCallback(
    async (partialQuery, filters = {}) => {
      return api.execute(async () => {
        const response = await searchApi.getSuggestions(partialQuery, filters);
        if (response.type === "success") {
          return response.data;
        }
        throw new Error(response.err || "Failed to get suggestions");
      });
    },
    [api]
  );

  // Advanced search
  const advancedSearch = useCallback(
    async (searchCriteria) => {
      return api.execute(async () => {
        const response = await searchApi.advancedSearch(searchCriteria);
        if (response.type === "success") {
          setSearchResults(response.data.results || []);
          setSearchMetadata(response.data.metadata || {});
          return response.data;
        }
        throw new Error(response.err || "Advanced search failed");
      });
    },
    [api]
  );

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchMetadata(null);
  }, []);

  return {
    creators,
    searchResults,
    currentCreator,
    searchMetadata,
    loading: api.loading,
    error: api.error,
    searchCreators,
    fetchCreators,
    getCreator,
    findSimilarCreators,
    getSearchSuggestions,
    advancedSearch,
    clearSearchResults,
    reset: api.reset,
  };
};
