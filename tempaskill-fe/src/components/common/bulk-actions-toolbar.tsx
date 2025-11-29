import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BulkAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
  disabled?: boolean;
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
}

/**
 * BulkActionsToolbar
 *
 * Reusable toolbar for bulk operations on selected items
 *
 * @example
 * ```tsx
 * <BulkActionsToolbar
 *   selectedCount={5}
 *   onClearSelection={() => setSelected(new Set())}
 *   actions={[
 *     {
 *       label: "Hapus Semua",
 *       icon: <Trash2 className="h-4 w-4" />,
 *       onClick: handleBulkDelete,
 *       variant: "destructive"
 *     }
 *   ]}
 * />
 * ```
 */
export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  actions,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {selectedCount} item dipilih
        </span>
      </div>
      <div className="flex items-center gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="gap-2"
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4 mr-2" />
          Batal
        </Button>
      </div>
    </div>
  );
}
