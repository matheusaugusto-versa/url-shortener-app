import { useEffect, useRef, useState } from 'react';

interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseAsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await asyncFunction();
      if (isMounted.current) {
        setState({ data: response, loading: false, error: null });
        onSuccess?.(response);
      }
      return response;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (isMounted.current) {
        setState({ data: null, loading: false, error: err });
        onError?.(err);
      }
      throw err;
    }
  };

  useEffect(() => {
    if (!immediate) return;
    execute();
  }, []);

  return {
    ...state,
    execute,
  };
}
