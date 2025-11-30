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

// Declare Midtrans Snap type
declare global {
  interface Window {
    snap?: {
      pay: (token: string, options?: SnapPayOptions) => void;
      embed: (
        token: string,
        options: {
          embedId: string;
          onSuccess?: () => void;
          onPending?: () => void;
          onError?: () => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface SnapPayResult {
  order_id: string;
  status_code: string;
  transaction_status: string;
  gross_amount: string;
}

interface SnapPayOptions {
  onSuccess?: (result: SnapPayResult) => void;
  onPending?: (result: SnapPayResult) => void;
  onError?: (result: SnapPayResult) => void;
  onClose?: () => void;
}

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
  const { data: paymentStatus } = usePaymentStatus(orderId);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load Midtrans Snap.js script
  useEffect(() => {
    console.log("📦 Loading Snap.js script...");
    const snapScript = document.createElement("script");
    snapScript.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    snapScript.setAttribute(
      "data-client-key",
      "SB-Mid-client-ZBuTiayOZocEGgLJ"
    );
    snapScript.async = true;

    snapScript.onload = () => {
      console.log("✅ Snap.js loaded successfully");
      setSnapLoaded(true);
    };

    snapScript.onerror = () => {
      console.error("❌ Failed to load Snap.js");
    };

    document.body.appendChild(snapScript);

    return () => {
      // Cleanup
      if (document.body.contains(snapScript)) {
        document.body.removeChild(snapScript);
      }
    };
  }, []);

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
        payment_method: selectedMethod as
          | "gopay"
          | "bank_transfer"
          | "credit_card"
          | "qris",
      });

      if (!result) {
        throw new Error("Failed to create payment transaction");
      }

      setOrderId(result.order_id);

      console.log("🔍 Payment Result:", {
        snap_token: result.snap_token,
        payment_url: result.payment_url,
        selectedMethod,
        snapLoaded,
        windowSnap: !!window.snap,
      });

      // Check if this is an existing pending payment (created within 24 hours)
      const createdTime = new Date(result.created_at).getTime();
      const now = Date.now();
      const ageInMinutes = (now - createdTime) / (1000 * 60);

      if (result.transaction_status === "pending" && ageInMinutes > 5) {
        // Existing payment (more than 5 minutes old)
        toast.info("Pembayaran Sudah Ada", {
          description:
            "Anda sudah memiliki pembayaran pending untuk kursus ini. Silakan selesaikan pembayaran sebelumnya.",
        });
      } else if (result.transaction_status === "pending" && ageInMinutes <= 5) {
        // New payment (just created)
        toast.success("Transaksi dibuat", {
          description: "Silakan selesaikan pembayaran di tab yang terbuka.",
        });
      }

      // TEMPORARY FIX: Always use redirect URL instead of Snap popup
      // Reason: Merchant account needs proper payment method configuration
      if (result.payment_url) {
        console.log("🔄 Opening payment URL in new tab");
        window.open(result.payment_url, "_blank");
        return;
      }

      // Original Snap.js integration (commented out until merchant is configured)
      /*
      // Use Snap.js for GoPay and QRIS (requires snap_token)
      if (
        result.snap_token &&
        (selectedMethod === "gopay" || selectedMethod === "qris")
      ) {
        console.log("✅ Attempting to open Snap popup");
        
        if (!window.snap || !snapLoaded) {
          console.error("❌ Snap not ready:", { windowSnap: !!window.snap, snapLoaded });
          toast.error("Snap.js belum siap", {
            description: "Tunggu sebentar dan coba lagi.",
          });
          return;
        }

        // Open Snap payment popup
        console.log("🚀 Opening Snap with token:", result.snap_token);
        
        try {
          window.snap.pay(result.snap_token, {
            onSuccess: () => {
              toast.success("Pembayaran berhasil!", {
                description: "Anda sekarang dapat mengakses kursus ini.",
              });
              onSuccess?.();
              onClose();
            },
            onPending: () => {
              toast.info("Pembayaran pending", {
                description: "Silakan selesaikan pembayaran Anda.",
              });
            },
            onError: () => {
              toast.error("Pembayaran gagal", {
                description:
                  "Silakan coba lagi atau pilih metode pembayaran lain.",
              });
            },
            onClose: () => {
              // User closed the popup
            },
          });
        } catch (error) {
          console.error("❌ Snap.pay error:", error);
          // Fallback: open redirect URL if Snap popup fails
          if (result.payment_url) {
            console.log("🔄 Falling back to redirect URL");
            window.open(result.payment_url, "_blank");
            toast.info("Pembayaran dibuka di tab baru", {
              description: "Silakan selesaikan pembayaran di halaman yang terbuka.",
            });
          }
        }
      } else if (result.payment_url) {
        // Fallback to redirect for other payment methods
        window.open(result.payment_url, "_blank");
        toast.success("Transaksi dibuat", {
          description: "Silakan selesaikan pembayaran di tab baru.",
        });
      } else {
        toast.error("Gagal membuat transaksi", {
          description: "Tidak ada payment URL atau snap token.",
        });
      }
      */
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
                disabled={
                  !selectedMethod ||
                  createPayment.isPending ||
                  ((selectedMethod === "gopay" || selectedMethod === "qris") &&
                    !snapLoaded)
                }
                className="bg-orange-600 hover:bg-orange-700"
              >
                {createPayment.isPending
                  ? "Memproses..."
                  : !snapLoaded &&
                    (selectedMethod === "gopay" || selectedMethod === "qris")
                  ? "Loading Snap.js..."
                  : "Bayar Sekarang"}
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
