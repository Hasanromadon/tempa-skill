"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";
import { useState } from "react";

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
  isOpen?: boolean;
  onToggle?: () => void;
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

export function FilterSidebar({
  filters,
  onFiltersChange,
  instructors = [],
  className,
  isOpen = true,
  onToggle,
}: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 1000000,
  ]);

  const updateFilter = (
    key: keyof CourseFilters,
    value: string | number | undefined
  ) => {
    const newFilters: CourseFilters = { ...filters };

    if (value === "" || value === undefined || value === null) {
      delete newFilters[key];
    } else {
      // Type-safe assignment
      switch (key) {
        case "category":
          newFilters.category = typeof value === "string" ? value : undefined;
          break;
        case "difficulty":
          newFilters.difficulty =
            value === "beginner" ||
            value === "intermediate" ||
            value === "advanced"
              ? value
              : undefined;
          break;
        case "minPrice":
        case "maxPrice":
          newFilters[key] = typeof value === "number" ? value : Number(value);
          break;
        case "instructorId":
          newFilters.instructorId =
            typeof value === "number"
              ? value
              : value
              ? parseInt(value as string)
              : undefined;
          break;
      }
    }

    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilter("minPrice", values[0]);
    updateFilter("maxPrice", values[1]);
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1000000]);
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.difficulty) count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice && filters.maxPrice < 1000000) count++;
    if (filters.instructorId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  const sidebarContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="font-semibold">Filter</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-8 px-2 text-xs"
          >
            Hapus Semua
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Kategori</Label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.value}`}
                checked={filters.category === category.value}
                onCheckedChange={(checked: boolean) => {
                  updateFilter("category", checked ? category.value : "");
                }}
              />
              <Label
                htmlFor={`category-${category.value}`}
                className="text-sm cursor-pointer"
              >
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tingkat Kesulitan</Label>
        <div className="space-y-2">
          {DIFFICULTIES.map((difficulty) => (
            <div key={difficulty.value} className="flex items-center space-x-2">
              <Checkbox
                id={`difficulty-${difficulty.value}`}
                checked={filters.difficulty === difficulty.value}
                onCheckedChange={(checked: boolean) => {
                  updateFilter("difficulty", checked ? difficulty.value : "");
                }}
              />
              <Label
                htmlFor={`difficulty-${difficulty.value}`}
                className="text-sm cursor-pointer"
              >
                {difficulty.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rentang Harga</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={1000000}
            min={0}
            step={50000}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Rp {priceRange[0].toLocaleString("id-ID")}</span>
            <span>Rp {priceRange[1].toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Instructor Filter */}
      {instructors.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Instruktur</Label>
          <Select
            value={filters.instructorId?.toString() || "all"}
            onValueChange={(value) => {
              updateFilter(
                "instructorId",
                value === "all" ? undefined : parseInt(value)
              );
            }}
          >
            <SelectTrigger>
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
      )}
    </div>
  );

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className={cn("fixed top-20 left-4 z-40 lg:hidden", className)}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onToggle}
      />

      {/* Sidebar */}
      <Card
        className={cn(
          "w-80 h-fit sticky top-6",
          "fixed left-0 top-0 z-50 h-full overflow-y-auto lg:relative lg:z-auto",
          "lg:block",
          className
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Filter Kursus</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>{sidebarContent}</CardContent>
      </Card>
    </>
  );
}
