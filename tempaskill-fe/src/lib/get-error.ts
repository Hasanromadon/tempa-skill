export interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

export const getError = (err: ApiError, defaultMessage?: string) => {
  // Try to extract error message from API error response
  const errorMessage = err?.response?.data?.error?.message;
  if (errorMessage) return errorMessage;
  if (err instanceof Error && err.message) return err.message;
  return defaultMessage || "Terjadi kesalahan. Silakan coba lagi.";
};
