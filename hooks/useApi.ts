import { useAsync } from './useAsync';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const { immediate = true, onSuccess, onError } = options;

  const { data, loading, error, execute } = useAsync(apiCall, {
    immediate,
    onSuccess,
    onError,
  });

  const retry = async (maxRetries = 3, delayMs = 1000) => {
    let lastError = error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await execute();
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, delayMs * Math.pow(2, attempt))
          );
        }
      }
    }
    
    throw lastError;
  };

  return {
    data,
    loading,
    error,
    execute,
    retry,
  };
}
