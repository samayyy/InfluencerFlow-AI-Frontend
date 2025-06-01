import { useState, useCallback } from "react";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiCall();

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || "An error occurred";
      setError(errorMessage);

      if (options.onError) {
        options.onError(err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};
