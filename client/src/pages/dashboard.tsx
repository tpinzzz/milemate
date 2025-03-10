import AuthCheck from "@/components/auth/AuthCheck";
import TripForm from "@/components/trips/TripForm";
import TripHistory from "@/components/trips/TripHistory";
import DashboardCard from "@/components/layout/DashboardCard";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";
import { useOnboarding } from "@/hooks/useOnboarding";
import { MapPin, Car, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Dashboard() {
  const { showOnboarding } = useOnboarding();
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <AuthCheck>
      <Dialog open={showOnboarding}>
        <DialogContent className="max-w-lg p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Welcome to Mileage Tracker</DialogTitle>
          </DialogHeader>
          <OnboardingFlow />
        </DialogContent>
      </Dialog>

      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />

      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeedback(true)}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Send Feedback
          </Button>
        </div>

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