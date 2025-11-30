"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import React, { useEffect, useState } from "react";

// ... (Tipe Data & Interface SAMA seperti sebelumnya) ...
export interface CourseFilters {
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  minPrice?: number;
  maxPrice?: number;
  instructorId?: number;
}

interface FilterSidebarProps {
  filters: CourseFilters;
  onFiltersChange: (filters: CourseFilters) => void;
  instructors?: Array<{ id: number; name: string }>;
  className?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const CATEGORIES = [
  { value: "programming", label: "Pemrograman" },
  { value: "design", label: "Desain" },
  { value: "business", label: "Bisnis" },
  { value: "marketing", label: "Pemasaran" },
];

const DIFFICULTIES = [
  { value: "beginner", label: "Pemula" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Lanjutan" },
];

// ... (CurrencyInput SAMA seperti sebelumnya) ...
interface CurrencyInputProps {
  value?: number;
  onChange: (val: number | undefined) => void;
  placeholder?: string;
  className?: string;
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  className,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  const formatValue = (val: number | undefined) => {
    if (val === undefined || val === null || isNaN(val)) return "";
    return "Rp " + val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const formatted = formatValue(value);
    if (displayValue !== formatted) {
      setDisplayValue(formatted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/\D/g, "");

    if (cleanValue === "") {
      setDisplayValue("");
      onChange(undefined);
    } else {
      const numValue = parseInt(cleanValue, 10);
      setDisplayValue(formatValue(numValue));
      onChange(numValue);
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={displayValue}
      onChange={handleChange}
      className={cn("text-sm", className)}
    />
  );
}

// --- MAIN COMPONENT ---
export function FilterSidebar({
  filters,
  onFiltersChange,
  instructors = [],
  className,
  isOpen,
  onToggle,
}: FilterSidebarProps) {
  const [localPrice, setLocalPrice] = useState<{ min?: number; max?: number }>({
    min: filters.minPrice,
    max: filters.maxPrice,
  });

  useEffect(() => {
    setLocalPrice({
      min: filters.minPrice,
      max: filters.maxPrice,
    });
  }, [filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        localPrice.min !== filters.minPrice ||
        localPrice.max !== filters.maxPrice
      ) {
        onFiltersChange({
          ...filters,
          minPrice: localPrice.min,
          maxPrice: localPrice.max,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPrice]);

  const updateFilter = (
    key: keyof CourseFilters,
    value: string | number | undefined
  ) => {
    const newFilters: CourseFilters = { ...filters };

    if (value === "" || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      if (key === "difficulty") {
        newFilters.difficulty = value as
          | "beginner"
          | "intermediate"
          | "advanced";
      } else if (key === "category") {
        newFilters.category = String(value);
      } else if (key === "instructorId") {
        newFilters[key] = Number(value);
      }
    }
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setLocalPrice({ min: undefined, max: undefined });
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.difficulty) count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice) count++;
    if (filters.instructorId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  // ✅ VARIABLE JSX (Bukan Function Component)
  const sidebarContent = (
    <div className="space-y-4">
      {/* Header & Reset - Ditaruh di luar Accordion agar selalu terlihat */}
      <div className="flex items-center justify-between pb-2 border-b lg:border-none">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-orange-600" />
          <h3 className="font-semibold text-gray-900 text-sm lg:text-base">
            Filter
          </h3>
          {activeFiltersCount > 0 && (
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-700 hover:bg-orange-200 ml-1 px-1.5 py-0.5 text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Reset
          </Button>
        )}
      </div>

      {/* ✅ ACCORDION WRAPPER */}
      <Accordion
        type="multiple"
        defaultValue={["category", "difficulty", "price", "instructor"]}
        className="w-full"
      >
        {/* Category Filter */}
        <AccordionItem value="category" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm hover:no-underline hover:text-orange-600">
            Kategori
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {CATEGORIES.map((category) => (
                <div
                  key={category.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`category-${category.value}`}
                    checked={filters.category === category.value}
                    onCheckedChange={(checked) => {
                      updateFilter(
                        "category",
                        checked ? category.value : undefined
                      );
                    }}
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <Label
                    htmlFor={`category-${category.value}`}
                    className="text-sm font-normal cursor-pointer text-gray-600 hover:text-orange-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Difficulty Filter */}
        <AccordionItem value="difficulty" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm hover:no-underline hover:text-orange-600">
            Tingkat Kesulitan
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-1">
              {DIFFICULTIES.map((difficulty) => (
                <div
                  key={difficulty.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`difficulty-${difficulty.value}`}
                    checked={filters.difficulty === difficulty.value}
                    onCheckedChange={(checked) => {
                      updateFilter(
                        "difficulty",
                        checked ? difficulty.value : undefined
                      );
                    }}
                    className="data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                  />
                  <Label
                    htmlFor={`difficulty-${difficulty.value}`}
                    className="text-sm font-normal cursor-pointer text-gray-600 hover:text-orange-600 leading-none"
                  >
                    {difficulty.label}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Input Filter */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm hover:no-underline hover:text-orange-600">
            Rentang Harga
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-1.5 pt-1 px-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">
                  Min
                </Label>
                <CurrencyInput
                  value={localPrice.min}
                  onChange={(val) =>
                    setLocalPrice((prev) => ({ ...prev, min: val }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase text-gray-500 font-semibold tracking-wider">
                  Max
                </Label>
                <CurrencyInput
                  value={localPrice.max}
                  onChange={(val) =>
                    setLocalPrice((prev) => ({ ...prev, max: val }))
                  }
                  placeholder="∞"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Instructor Filter */}
        {instructors.length > 0 && (
          <AccordionItem value="instructor" className="border-b-0">
            <AccordionTrigger className="py-3 text-sm hover:no-underline hover:text-orange-600">
              Instruktur
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-1">
                <Select
                  value={filters.instructorId?.toString() || "all"}
                  onValueChange={(value) => {
                    updateFilter(
                      "instructorId",
                      value === "all" ? undefined : value
                    );
                  }}
                >
                  <SelectTrigger className="w-full text-sm focus:ring-orange-500 h-9">
                    <SelectValue placeholder="Pilih instruktur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Instruktur</SelectItem>
                    {instructors.map((instructor) => (
                      <SelectItem
                        key={instructor.id}
                        value={instructor.id.toString()}
                      >
                        {instructor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full flex justify-between items-center border-orange-200 text-orange-700 hover:bg-orange-50 bg-white"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Kursus
          </span>
          {activeFiltersCount > 0 && (
            <Badge className="bg-orange-600 hover:bg-orange-700">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Overlay & Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onToggle}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white p-6 shadow-xl transition-transform animate-in slide-in-from-left flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-900">Filter</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {/* Scroll area untuk mobile */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Sidebar */}
      <Card
        className={cn(
          "hidden lg:block h-fit sticky top-24 w-72 shadow-sm",
          className
        )}
      >
        <CardContent className="p-5">{sidebarContent}</CardContent>
      </Card>
    </>
  );
}
