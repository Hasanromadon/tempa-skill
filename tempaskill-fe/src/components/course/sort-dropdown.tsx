"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Clock, DollarSign, Star, TrendingUp } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: "created_at-desc",
    label: "Terbaru",
    icon: Clock,
  },
  {
    value: "created_at-asc",
    label: "Terlama",
    icon: Clock,
  },
  {
    value: "popularity-desc",
    label: "Paling Populer",
    icon: TrendingUp,
  },
  {
    value: "rating-desc",
    label: "Rating Tertinggi",
    icon: Star,
  },
  {
    value: "price-asc",
    label: "Harga Terendah",
    icon: DollarSign,
  },
  {
    value: "price-desc",
    label: "Harga Tertinggi",
    icon: DollarSign,
  },
  {
    value: "title-asc",
    label: "Nama A-Z",
    icon: ArrowUpDown,
  },
  {
    value: "title-desc",
    label: "Nama Z-A",
    icon: ArrowUpDown,
  },
];

interface SortDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SortDropdown({
  value,
  onValueChange,
  className,
}: SortDropdownProps) {
  const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-gray-600 whitespace-nowrap">Urutkan:</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className={cn("w-48", className)}>
          <div className="flex items-center gap-2">
            {selectedOption && <selectedOption.icon className="h-4 w-4" />}
            <SelectValue placeholder="Pilih pengurutan" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Alternative button-style sort dropdown
interface SortButtonProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function SortButton({
  value,
  onValueChange,
  className,
}: SortButtonProps) {
  const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <Button variant="outline" size="sm" asChild className={className}>
        <SelectTrigger>
          <div className="flex items-center gap-2">
            {selectedOption ? (
              <>
                <selectedOption.icon className="h-4 w-4" />
                <span>{selectedOption.label}</span>
              </>
            ) : (
              <>
                <ArrowUpDown className="h-4 w-4" />
                <span>Urutkan</span>
              </>
            )}
          </div>
        </SelectTrigger>
      </Button>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <option.icon className="h-4 w-4" />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
