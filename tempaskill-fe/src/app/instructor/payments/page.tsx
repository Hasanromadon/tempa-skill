"use client";

import { PaymentListPage } from "@/components/payment/payment-list-page";

/**
 * Instructor Payments Page
 * Uses reusable PaymentListPage component with instructor-specific features:
 * - View only settlement transactions (auto-filtered by backend)
 * - 2 stats cards (My Revenue, Total Transactions)
 * - Email student action instead of view details
 * - No status filter dropdown
 */
export default function InstructorPaymentsPage() {
  return (
    <PaymentListPage
      basePath="/instructor"
      title="Pembayaran Saya"
      description="Pantau pendapatan dari kursus Anda"
    />
  );
}
