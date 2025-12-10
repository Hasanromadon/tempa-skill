"use client";

import { cn } from "@/app/utils/cn-classes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
} from "lucide-react";
import * as React from "react";

export interface SortOption {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Saya menyarankan icon yang lebih spesifik untuk A-Z dan Z-A jika tersedia,
// tapi ArrowUpDown juga oke.
const SORT_OPTIONS: SortOption[] = [
  { value: "created_at-desc", label: "Terbaru", icon: Clock },
  { value: "created_at-asc", label: "Terlama", icon: Clock },
  { value: "popularity-desc", label: "Paling Populer", icon: TrendingUp },
  { value: "rating-desc", label: "Rating Tertinggi", icon: Star },
  { value: "price-asc", label: "Harga Terendah", icon: DollarSign },
  { value: "price-desc", label: "Harga Tertinggi", icon: DollarSign },
  { value: "title-asc", label: "Nama A-Z", icon: ArrowDownAZ }, // Update icon jika ada
  { value: "title-desc", label: "Nama Z-A", icon: ArrowUpAZ }, // Update icon jika ada
];

interface SortProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

// ==========================================
// 1. Sort Dropdown (Standard Style)
// ==========================================
export function SortDropdown({ value, onValueChange, className }: SortProps) {
  const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden sm:inline-block">
        Urutkan:
      </span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[180px] bg-background">
          <div className="flex items-center gap-2 truncate">
            {selectedOption ? (
              <>
                <selectedOption.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{selectedOption.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Pilih urutan</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent align="end" className="w-[200px]">
          {SORT_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <option.icon className="h-4 w-4 text-muted-foreground" />
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ==========================================
// 2. Sort Button (Minimalist / Compact Style)
// ==========================================
export function SortButton({ value, onValueChange, className }: SortProps) {
  const selectedOption = SORT_OPTIONS.find((option) => option.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      {/* FIX: Jangan nest <Button> di dalam <SelectTrigger>. 
         Cukup beri style pada SelectTrigger agar terlihat seperti button.
      */}
      <SelectTrigger
        className={cn(
          "h-9 px-3 w-auto min-w-[140px] gap-2 border-dashed shadow-sm hover:bg-accent hover:text-accent-foreground",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {selectedOption ? (
            <>
              <selectedOption.icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <>
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Urutkan</span>
            </>
          )}
        </div>
      </SelectTrigger>

      <SelectContent align="end" className="w-[200px]">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex items-center gap-2">
              <option.icon className="h-4 w-4 text-muted-foreground" />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
