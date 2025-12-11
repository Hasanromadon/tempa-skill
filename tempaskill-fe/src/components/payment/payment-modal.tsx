"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useCreatePayment, usePaymentStatus } from "@/hooks/use-payment";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  QrCode,
  Smartphone,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// --- TYPE DEFINITIONS ---
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  coursePrice: number;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "gopay",
    name: "GoPay",
    icon: Smartphone,
    desc: "Scan QR atau aplikasi Gojek",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "qris",
    name: "QRIS",
    icon: QrCode,
    desc: "Scan dengan OVO, Dana, LinkAja",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    icon: Building2,
    desc: "BCA, Mandiri, BNI, BRI",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "credit_card",
    name: "Kartu Kredit/Debit",
    icon: CreditCard,
    desc: "Visa, Mastercard, JCB",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
] as const;

export function PaymentModal({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  coursePrice,
  onSuccess,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "gopay" | "bank_transfer" | "credit_card" | "qris" | ""
  >("");
  const [orderId, setOrderId] = useState<string>("");

  const createPayment = useCreatePayment();
  const { data: paymentStatus } = usePaymentStatus(orderId);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod("");
      setOrderId("");
    }
  }, [isOpen]);

  // Payment Status Handler
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.transaction_status === "settlement") {
        toast.success("Pembayaran Berhasil!", {
          description: "Selamat belajar! Akses kursus telah dibuka.",
        });
        onSuccess?.();
        onClose();
      } else if (
        ["failure", "deny"].includes(paymentStatus.transaction_status)
      ) {
        toast.error("Pembayaran Gagal", {
          description: "Silakan coba metode pembayaran lain.",
        });
      }
    }
  }, [paymentStatus, onSuccess, onClose]);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    try {
      const result = await createPayment.mutateAsync({
        course_id: courseId,
        payment_method: selectedMethod,
      });

      if (!result) throw new Error("Gagal membuat transaksi");

      setOrderId(result.order_id);

      // Handle Existing Pending Payment
      const createdTime = new Date(result.created_at).getTime();
      const ageInMinutes = (Date.now() - createdTime) / (1000 * 60);

      if (result.transaction_status === "pending" && ageInMinutes > 5) {
        toast.info("Lanjutkan Pembayaran", {
          description: "Anda memiliki transaksi pending. Silakan selesaikan.",
        });
      } else {
        toast.success("Link Pembayaran Siap", {
          description: "Silakan selesaikan pembayaran di tab baru.",
        });
      }

      // Always redirect to Midtrans hosted page for reliability
      if (result.payment_url) {
        window.open(result.payment_url, "_blank");
      } else {
        toast.error("Gagal membuka halaman pembayaran");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Gagal memproses", {
        description: "Terjadi kesalahan saat membuat transaksi.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b bg-slate-50">
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-orange-600" />
            Pembayaran Kursus
          </DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran untuk mulai belajar.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* 1. ORDER SUMMARY */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
              Item Pembelian
            </p>
            <h3 className="font-bold text-slate-900 line-clamp-1">
              {courseTitle}
            </h3>
            <Separator className="my-3 bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Harga</span>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(coursePrice)}
              </span>
            </div>
          </div>

          {/* 2. PAYMENT STATUS (If transaction created) */}
          {paymentStatus ? (
            <div className="space-y-4">
              <Alert
                className={`border-l-4 ${
                  paymentStatus.transaction_status === "pending"
                    ? "border-l-yellow-500 bg-yellow-50"
                    : paymentStatus.transaction_status === "failure"
                    ? "border-l-red-500 bg-red-50"
                    : "bg-slate-50"
                }`}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm font-medium">
                  Status:{" "}
                  <span className="uppercase">
                    {paymentStatus.transaction_status}
                  </span>
                </AlertDescription>
              </Alert>

              {paymentStatus.payment_url && (
                <Button
                  className="w-full bg-slate-900 hover:bg-slate-800"
                  onClick={() =>
                    window.open(paymentStatus.payment_url, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4 mr-2" /> Buka Halaman
                  Pembayaran
                </Button>
              )}
            </div>
          ) : (
            /* 3. PAYMENT METHODS SELECTION */
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Pilih Metode Pembayaran
              </p>
              <div className="grid grid-cols-1 gap-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500"
                          : "border-slate-200 hover:border-orange-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-full ${method.bg}`}>
                        <Icon className={`w-5 h-5 ${method.color}`} />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">
                          {method.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {method.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-orange-600 ml-auto" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100">
          {!orderId ? (
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Batal
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handlePayment}
                disabled={!selectedMethod || createPayment.isPending}
              >
                {createPayment.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={onClose}>
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
