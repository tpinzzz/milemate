import AuthCheck from "@/components/auth/AuthCheck";
import TripForm from "@/components/trips/TripForm";
import TripHistory from "@/components/trips/TripHistory";
import DashboardCard from "@/components/layout/DashboardCard";
import { MapPin, Car } from "lucide-react";

export default function Dashboard() {
  return (
    <AuthCheck>
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
