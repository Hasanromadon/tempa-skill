import { formatCurrency } from "@/app/utils/format-currency";
import { Course } from "@/types/api";
import { ArrowRight, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface CourseCardPublicProps {
  course: Course;
}

export const CourseCardPublic = ({ course }: CourseCardPublicProps) => {
  return (
    <Link
      key={course.id}
      href={`/courses/${course.slug}`}
      className="group h-full"
    >
      <div className="h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
        {/* Image Container */}
        <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-500">
              <BookOpen className="text-white" />
            </div>
          )}

          {course.is_enrolled && (
            <div className="absolute top-3 left-3 z-10">
              <Badge className="bg-green-500 text-white border-none shadow-sm flex items-center gap-1 px-2 py-0.5">
                Terdaftar
              </Badge>
            </div>
          )}

          {/* Badge Difficulty (Posisi Kanan Atas) */}
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-white/90 text-gray-800 backdrop-blur-sm shadow-sm">
              {course.difficulty}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {course.description}
          </p>

          <div className="mt-auto pt-2 border-t border-gray-50 flex justify-between items-center">
            <span className="font-bold text-lg">
              {formatCurrency(course.price)}
            </span>

            {/* ✅ Update Text Action: Detail / Lanjut */}
            <span className="text-sm text-orange-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              {course.is_enrolled ? "Lanjut" : "Detail"}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
