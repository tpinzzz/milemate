import AuthCheck from "@/components/auth/AuthCheck";
import TripForm from "@/components/trips/TripForm";
import TripHistory from "@/components/trips/TripHistory";
import DashboardCard from "@/components/layout/DashboardCard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";
import { MapPin, Car } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const { showOnboarding, completeOnboarding } = useOnboarding();

  return (
    <AuthCheck>
      <Dialog open={showOnboarding} onOpenChange={(open) => !open && completeOnboarding()}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Welcome to Mileage Tracker</DialogTitle>
          </DialogHeader>
          <OnboardingFlow />
        </DialogContent>
      </Dialog>

      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid gap-8">
          <DashboardCard title="Log New Trip">
            <TripForm />
          </DashboardCard>

          <div className="grid gap-4 md:grid-cols-2">
            <DashboardCard 
              title="GPS Tracking" 
              icon={<MapPin />}
            >
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Coming Soon: Automatic trip tracking with GPS
                </p>
              </div>
            </DashboardCard>

            <DashboardCard 
              title="OBD-II Integration" 
              icon={<Car />}
            >
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Coming Soon: Connect directly to your vehicle
                </p>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard title="Trip History">
            <TripHistory />
          </DashboardCard>
        </div>
      </div>
    </AuthCheck>
  );
}