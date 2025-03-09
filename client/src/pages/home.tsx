import { useAuthState } from "react-firebase-hooks/auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import LoginButton from "@/components/auth/LoginButton";
import { Car } from "lucide-react";

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Track Your Miles Effortlessly
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Simple, reliable mileage tracking for business and personal trips.
                  Log your journeys and export reports with ease.
                </p>
              </div>
              <div className="space-y-4 w-full max-w-sm">
                <LoginButton />
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 items-center">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <Car className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-bold">Manual Logging</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quickly log your trips with start and end mileage readings
                </p>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="relative">
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <Car className="h-12 w-12 mb-4" />
                </div>
                <h3 className="text-lg font-bold">GPS Tracking</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Automatic trip tracking with GPS integration
                </p>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <div className="relative">
                  <div className="absolute -top-2 -right-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                  <Car className="h-12 w-12 mb-4" />
                </div>
                <h3 className="text-lg font-bold">OBD-II Integration</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Direct mileage readings from your vehicle
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
