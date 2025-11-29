import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Info } from "lucide-react";

interface BulkConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemCount: number;
  itemType: string;
  actionLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
  details?: string[];
}

/**
 * BulkConfirmDialog
 *
 * Reusable confirmation dialog for bulk operations
 *
 * @example
 * ```tsx
 * <BulkConfirmDialog
 *   open={dialogOpen}
 *   onOpenChange={setDialogOpen}
 *   onConfirm={handleConfirm}
 *   title="Hapus Pengguna"
 *   description="Apakah Anda yakin ingin menghapus pengguna yang dipilih?"
 *   itemCount={5}
 *   itemType="pengguna"
 *   variant="destructive"
 *   isLoading={isDeleting}
 *   details={["John Doe", "Jane Smith", "..."]}
 * />
 * ```
 */
export function BulkConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemCount,
  itemType,
  actionLabel = "Lanjutkan",
  variant = "default",
  isLoading = false,
  details,
}: BulkConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" ? (
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-blue-100 rounded-full">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
            )}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-2">
            <p>{description}</p>

            {/* Item count badge */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">
                Jumlah {itemType}:
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded">
                {itemCount}
              </span>
            </div>

            {/* Details list (max 5 items) */}
            {details && details.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Detail:</p>
                <ul className="text-sm text-gray-600 space-y-1 max-h-32 overflow-y-auto">
                  {details.slice(0, 5).map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-600">•</span>
                      {detail}
                    </li>
                  ))}
                  {details.length > 5 && (
                    <li className="text-gray-500 italic">
                      dan {details.length - 5} lainnya...
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Warning for destructive actions */}
            {variant === "destructive" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-orange-600 hover:bg-orange-700"
            }
          >
            {isLoading ? "Memproses..." : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
