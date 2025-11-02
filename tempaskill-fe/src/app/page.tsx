import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Learn Skills Through
              <span className="text-orange-600"> Text-Based Courses</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              TempaSKill offers efficient learning through text-based materials
              combined with bi-weekly live sessions for interactive Q&A and live
              coding.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8"
                >
                  Browse Courses
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 text-lg px-8"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why TempaSKill?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A hybrid approach to online learning
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Text-Based Learning</CardTitle>
                <CardDescription>
                  Efficient, bandwidth-friendly courses you can read at your own
                  pace
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Live Sessions</CardTitle>
                <CardDescription>
                  Bi-weekly Zoom/Meet sessions for Q&A and interactive learning
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Fast & Accessible</CardTitle>
                <CardDescription>
                  Learn anywhere, even with limited internet bandwidth
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your learning journey and complete courses at your
                  pace
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to Start Learning?
          </h2>
          <p className="mt-4 text-lg text-orange-100">
            Join thousands of students learning efficiently with TempaSKill
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8"
              >
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p>&copy; 2025 TempaSKill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
