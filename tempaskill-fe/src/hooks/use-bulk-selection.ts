import { useCallback, useState } from "react";

/**
 * useBulkSelection Hook
 *
 * Reusable hook for managing bulk selection state
 *
 * @example
 * ```tsx
 * const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
 * const selection = useBulkSelection<number>();
 *
 * <Checkbox
 *   checked={selection.isAllSelected(items)}
 *   onCheckedChange={() => selection.toggleSelectAll(items.map(i => i.id))}
 * />
 *
 * {items.map(item => (
 *   <Checkbox
 *     checked={selection.isSelected(item.id)}
 *     onCheckedChange={() => selection.toggleItem(item.id)}
 *   />
 * ))}
 * ```
 */
export function useBulkSelection<T = number>() {
  const [selected, setSelected] = useState<Set<T>>(new Set());

  const toggleItem = useCallback((id: T) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: T[]) => {
    setSelected((prev) => {
      if (prev.size === allIds.length) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, []);

  const isSelected = useCallback(
    (id: T) => {
      return selected.has(id);
    },
    [selected]
  );

  const isAllSelected = useCallback(
    (items: Array<{ id: T }> | T[]) => {
      if (items.length === 0) return false;
      const ids =
        typeof items[0] === "object"
          ? (items as Array<{ id: T }>).map((item) => item.id)
          : (items as T[]);
      return ids.length > 0 && ids.every((id) => selected.has(id));
    },
    [selected]
  );

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const getSelectedItems = useCallback(() => {
    return Array.from(selected);
  }, [selected]);

  return {
    selected,
    toggleItem,
    toggleSelectAll,
    isSelected,
    isAllSelected,
    clearSelection,
    getSelectedItems,
    selectedCount: selected.size,
  };
}
