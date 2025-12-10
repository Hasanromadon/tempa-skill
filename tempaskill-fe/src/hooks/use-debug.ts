import { generateRequestId } from "@/app/utils/generate-process-id";
import { useCallback } from "react";

/**
 * Hook for debugging utilities including request ID generation
 */
export function useDebug() {
  const getRequestId = useCallback(() => {
    return generateRequestId();
  }, []);

  const logRequestId = useCallback((context?: string) => {
    const requestId = generateRequestId();
    console.log(`[Debug] ${context || "Request ID"}: ${requestId}`);
    return requestId;
  }, []);

  return {
    getRequestId,
    logRequestId,
  };
}
