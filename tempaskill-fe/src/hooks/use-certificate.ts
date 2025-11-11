import apiClient from "@/lib/api-client";
import type { CertificateEligibilityResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useCertificate = (courseId?: number) => {
  return useQuery<CertificateEligibilityResponse | null>({
    queryKey: ["certificate", courseId],
    queryFn: async () => {
      if (!courseId) return null;
      const res = await apiClient.get(`/certificates?course_id=${courseId}`);
      return res.data.data;
    },
    enabled: !!courseId,
  });
};

export const useIssueCertificate = () => {
  return useMutation({
    mutationFn: async (courseId: number) => {
      const res = await apiClient.post(`/certificates/issue`, {
        course_id: courseId,
      });
      return res.data.data;
    },
  });
};

export const useDownloadCertificate = () => {
  return useMutation({
    mutationFn: async (certificateId: string) => {
      const res = await apiClient.get(
        `/certificates/${certificateId}/download`,
        {
          responseType: "blob",
        }
      );
      return res.data;
    },
  });
};
