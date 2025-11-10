"use client";

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
import { formatCurrency } from "@/lib/utils";
import {
  Building2,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  QrCode,
  Smartphone,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    description: "Bayar dengan GoPay atau GoPayLater",
    color: "text-green-600",
  },
  {
    id: "qris",
    name: "QRIS",
    icon: QrCode,
    description: "Scan QR code dengan aplikasi e-wallet",
    color: "text-purple-600",
  },
  {
    id: "bank_transfer",
    name: "Transfer Bank",
    icon: Building2,
    description: "Transfer ke rekening bank",
    color: "text-blue-600",
  },
  {
    id: "credit_card",
    name: "Kartu Kredit",
    icon: CreditCard,
    description: "Bayar dengan kartu kredit/debit",
    color: "text-orange-600",
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
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");

  const createPayment = useCreatePayment();
  const { data: paymentStatus, isLoading: statusLoading } =
    usePaymentStatus(orderId);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedMethod("");
      setOrderId("");
    }
  }, [isOpen]);

  // Handle payment status changes
  useEffect(() => {
    if (paymentStatus) {
      if (paymentStatus.transaction_status === "settlement") {
        toast.success("Pembayaran berhasil!", {
          description: "Anda sekarang dapat mengakses kursus ini.",
        });
        onSuccess?.();
        onClose();
      } else if (paymentStatus.transaction_status === "failure") {
        toast.error("Pembayaran gagal", {
          description: "Silakan coba lagi atau pilih metode pembayaran lain.",
        });
      }
    }
  }, [paymentStatus, onSuccess, onClose]);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    try {
      const result = await createPayment.mutateAsync({
        course_id: courseId,
        payment_method: selectedMethod as any,
      });

      if (!result) {
        throw new Error("Failed to create payment transaction");
      }

      setOrderId(result.order_id);

      // Open payment URL if available
      if (result.payment_url) {
        window.open(result.payment_url, "_blank");
      }

      toast.success("Transaksi dibuat", {
        description: "Silakan selesaikan pembayaran di tab baru.",
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      toast.error("Gagal membuat transaksi", {
        description: "Silakan coba lagi.",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "settlement":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "failure":
      case "cancel":
      case "expire":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "settlement":
        return "Pembayaran Berhasil";
      case "pending":
        return "Menunggu Pembayaran";
      case "failure":
        return "Pembayaran Gagal";
      case "cancel":
        return "Dibatalkan";
      case "expire":
        return "Kadaluarsa";
      default:
        return "Status Tidak Diketahui";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bayar Kursus</DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran untuk mengakses kursus ini
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg">{courseTitle}</h3>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-bold text-orange-600">
                {formatCurrency(coursePrice)}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <div className="bg-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(paymentStatus.transaction_status)}
                <span className="font-medium">
                  {getStatusText(paymentStatus.transaction_status)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Order ID: {paymentStatus.order_id}
              </p>
              {paymentStatus.payment_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() =>
                    window.open(paymentStatus.payment_url, "_blank")
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Buka Halaman Pembayaran
                </Button>
              )}
            </div>
          )}

          {/* Payment Methods */}
          {!orderId && (
            <>
              <div>
                <h4 className="font-medium mb-3">Pilih Metode Pembayaran</h4>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-3 border rounded-lg text-left transition-colors ${
                          selectedMethod === method.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${method.color}`} />
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-gray-600">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="text-sm text-gray-600">
                <p>• Pembayaran akan diproses secara real-time</p>
                <p>
                  • Kursus akan langsung dapat diakses setelah pembayaran
                  berhasil
                </p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!orderId ? (
            <>
              <Button variant="outline" onClick={onClose}>
                Batal
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!selectedMethod || createPayment.isPending}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {createPayment.isPending ? "Memproses..." : "Bayar Sekarang"}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={onClose}>
              Tutup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
