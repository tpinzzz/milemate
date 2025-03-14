import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firebase";
import { getTrips } from "@/lib/api";
import { type Trip } from "@/lib/types";
import { MILEAGE_RATE, formatMileage } from "@/lib/utils";
import { DollarSign } from "lucide-react";

export default function TaxDeductionSummary() {
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      return getTrips(auth.currentUser.uid);
    },
    enabled: !!auth.currentUser?.uid,
  });

  // Calculate total tax deduction for completed business trips
  const calculateTotalDeduction = () => {
    if (!trips || trips.length === 0) return 0;

    return trips.reduce((total, trip) => {
      // Only include completed business trips with end mileage
      if (trip.status === "completed" && trip.purpose === "Business" && trip.endMileage) {
        const miles = Number(trip.endMileage) - Number(trip.startMileage);
        return total + (miles * MILEAGE_RATE);
      }
      return total;
    }, 0);
  };

  // Calculate total business miles
  const calculateTotalBusinessMiles = () => {
    if (!trips || trips.length === 0) return 0;

    return trips.reduce((total, trip) => {
      // Only include completed business trips with end mileage
      if (trip.status === "completed" && trip.purpose === "Business" && trip.endMileage) {
        const miles = Number(trip.endMileage) - Number(trip.startMileage);
        return total + miles;
      }
      return total;
    }, 0);
  };

  const totalDeduction = calculateTotalDeduction();
  const totalBusinessMiles = calculateTotalBusinessMiles();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Tax Deduction Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          Tax Deduction Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-green-600">${totalDeduction.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">Estimated tax deduction for {new Date().getFullYear()}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xl font-semibold">{formatMileage(totalBusinessMiles)} miles</span>
            <span className="text-sm text-muted-foreground">Total business miles tracked</span>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Based on {MILEAGE_RATE.toFixed(2)}/mile standard mileage rate
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 