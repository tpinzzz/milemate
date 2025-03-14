import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/firebase";
import { getTrips } from "@/lib/api";
import { type Trip, type TripPurpose } from "@/lib/types";
import { Download, Play, Square, Info, Clock, Briefcase, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCsvData, formatMileage } from "@/lib/utils";
import EndTripDialog from "./EndTripDialog";
import StartTripDialog from "./StartTripDialog";
import { format } from "date-fns";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEndTripDialog, setShowEndTripDialog] = useState(false);
  const [showStartTripDialog, setShowStartTripDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [tripPurpose, setTripPurpose] = useState<TripPurpose>("Business");

  // Query for any in-progress trip for the current user
  const { data: trips, isLoading, refetch } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      console.log("Fetching trips for user:", auth.currentUser?.uid);
      const result = await getTrips(auth.currentUser.uid);
      console.log("Fetched trips:", result);
      return result;
    },
    enabled: !!auth.currentUser?.uid,
  });

  // Force a refetch when the component mounts
  useEffect(() => {
    console.log("Component mounted, forcing refetch");
    refetch();
  }, [refetch]);

  // Find in-progress trip
  const inProgressTrip = trips?.find(trip => trip.status === "in_progress");
  
  // Get the last completed trip to suggest a start mileage
  const lastCompletedTrip = trips
    ?.filter(trip => trip.status === "completed" && trip.endMileage !== null)
    .sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime())[0];

  // Log debug info with more details
  useEffect(() => {
    const debugMessage = `
      Loading: ${isLoading}
      Trips count: ${trips?.length ?? 'no trips'}
      In-progress: ${inProgressTrip ? 'yes' : 'no'}
      Button disabled: ${isLoading || !!inProgressTrip}
    `.trim();
    
    setDebugInfo(debugMessage);
    console.log("Debug state:", {
      isLoading,
      tripsCount: trips?.length,
      hasInProgressTrip: !!inProgressTrip,
      buttonDisabled: isLoading || !!inProgressTrip
    });
  }, [trips, inProgressTrip, isLoading]);

  // Function to export trips as CSV
  const handleExport = () => {
    if (!trips) return;

    // Convert trips to the expected format for generateCsvData
    const formattedTrips = trips.map(trip => ({
      ...trip,
      startMileage: String(trip.startMileage),
      endMileage: trip.endMileage !== null ? String(trip.endMileage) : null,
    }));

    const csvContent = generateCsvData(formattedTrips);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `mileage_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Your trip data has been exported to CSV.",
    });
  };

  // Calculate time elapsed for in-progress trip
  const getTimeElapsed = () => {
    if (!inProgressTrip?.tripDate) return null;
    
    const startDate = new Date(inProgressTrip.tripDate);
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    
    // If less than a day, show hours
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    
    // Otherwise show days
    const days = Math.floor(diffMs / 86400000);
    return days === 1 ? "1 day" : `${days} days`;
  };

  const timeElapsed = getTimeElapsed();

  return (
    <div className="p-4 space-y-4">
      {/* Debug info - remove in production */}
      {debugInfo && (
        <div className="text-xs text-muted-foreground mb-2">
          {debugInfo}
        </div>
      )}
      
      {/* Current Trip Status */}
      {inProgressTrip && (
        <Card className="bg-amber-50 border-amber-200 mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-amber-500 mr-2" />
                <span className="font-medium text-amber-700">Trip in Progress</span>
              </div>
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                {timeElapsed ? `${timeElapsed} ago` : "Just started"}
              </Badge>
            </div>
            <div className="text-sm text-amber-700">
              <div className="flex items-center justify-between">
                <span>Start: {formatMileage(Number(inProgressTrip.startMileage))} miles</span>
                <span>{format(new Date(inProgressTrip.tripDate), "MMM d, h:mm a")}</span>
              </div>
              <div className="mt-1">Purpose: {inProgressTrip.purpose}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip Purpose Selection */}
      {!inProgressTrip && (
        <div className="flex gap-2 justify-center mb-2">
          <Button
            size="sm"
            variant={tripPurpose === "Business" ? "default" : "outline"}
            onClick={() => setTripPurpose("Business")}
            className={tripPurpose === "Business" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Business
          </Button>
          <Button
            size="sm"
            variant={tripPurpose === "Personal" ? "default" : "outline"}
            onClick={() => setTripPurpose("Personal")}
            className={tripPurpose === "Personal" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Car className="h-4 w-4 mr-2" />
            Personal
          </Button>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid gap-3">
        <Button 
          className="w-full flex justify-between" 
          variant={inProgressTrip ? "outline" : "default"}
          onClick={() => setShowStartTripDialog(true)}
          disabled={isLoading || !!inProgressTrip}
        >
          <div className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Start New {tripPurpose} Trip
          </div>
          {lastCompletedTrip && !inProgressTrip && (
            <Badge variant="outline">
              Suggested: {formatMileage(Number(lastCompletedTrip.endMileage))}
            </Badge>
          )}
        </Button>
        
        <Button 
          className="w-full flex justify-between" 
          variant={!inProgressTrip ? "outline" : "default"}
          onClick={() => setShowEndTripDialog(true)}
          disabled={isLoading || !inProgressTrip}
        >
          <div className="flex items-center">
            <Square className="h-4 w-4 mr-2" />
            End Current Trip
          </div>
          {inProgressTrip && (
            <Badge variant="outline">
              From: {formatMileage(Number(inProgressTrip.startMileage))}
            </Badge>
          )}
        </Button>
        
        <Button 
          className="w-full flex justify-between" 
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !trips?.length}
        >
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </div>
          {trips && trips.length > 0 && (
            <Badge variant="outline">
              {trips.length} trips
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Empty state message */}
      {!isLoading && trips?.length === 0 && (
        <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-2" />
          No trips recorded yet. Start by logging your first trip.
        </div>
      )}
      
      {/* Start Trip Dialog */}
      <StartTripDialog
        open={showStartTripDialog}
        onOpenChange={setShowStartTripDialog}
        suggestedStartMileage={lastCompletedTrip?.endMileage || 0}
        purpose={tripPurpose}
        onSuccess={() => refetch()}
      />
      
      {/* End Trip Dialog */}
      <EndTripDialog 
        open={showEndTripDialog} 
        onOpenChange={setShowEndTripDialog} 
        currentTrip={inProgressTrip || null} 
      />
    </div>
  );
} 