"use client";

import { PaymentListPage } from "@/components/payment/payment-list-page";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import Link from "next/link";

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
    <div className="space-y-6">
      {/* Withdrawal Link */}
      <div className="flex justify-end">
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/instructor/withdrawals">
            <Wallet className="h-4 w-4 mr-2" />
            Penarikan Dana
          </Link>
        </Button>
      </div>

      <PaymentListPage
        basePath="/instructor"
        title="Pembayaran Saya"
        description="Pantau pendapatan dari kursus Anda"
      />
    </div>
  );
}
