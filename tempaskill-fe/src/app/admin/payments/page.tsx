"use client";

import { PaymentListPage } from "@/components/payment/payment-list-page";

/**
 * Admin Payments Page
 * Uses reusable PaymentListPage component
 */
export default function AdminPaymentsPage() {
  return (
    <PaymentListPage
      basePath="/admin"
      title="Pembayaran"
      description="Kelola dan pantau semua transaksi pembayaran"
    />
  );
}
