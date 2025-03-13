import { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/firebase";
import { getTrips, createTrip } from "@/lib/api";
import { type Trip } from "@/lib/types";
import { Download, Play, Square, Info, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCsvData, formatMileage } from "@/lib/utils";
import EndTripDialog from "./EndTripDialog";
import { format } from "date-fns";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEndTripDialog, setShowEndTripDialog] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Query for any in-progress trip for the current user
  const { data: trips, isLoading, refetch } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      const result = await getTrips(auth.currentUser.uid);
      console.log("Fetched trips:", result);
      return result;
    },
    enabled: !!auth.currentUser?.uid,
  });

  // Force a refetch when the component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Find in-progress trip
  const inProgressTrip = trips?.find(trip => trip.status === "in_progress");
  
  // Log debug info
  useEffect(() => {
    if (trips) {
      setDebugInfo(`Found ${trips.length} trips, ${inProgressTrip ? "has" : "no"} in-progress trip`);
      console.log("Trips:", trips);
      console.log("In-progress trip:", inProgressTrip);
    }
  }, [trips, inProgressTrip]);
  
  // Get the last completed trip to suggest a start mileage
  const lastCompletedTrip = trips
    ?.filter(trip => trip.status === "completed" && trip.endMileage !== null)
    .sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime())[0];

  // Mutation for starting a new trip
  const startTripMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      
      // Get the last completed trip to use its end mileage as the new start mileage
      const startMileage = lastCompletedTrip?.endMileage || 0;
      
      console.log("Starting trip with mileage:", startMileage);
      
      return createTrip({
        userId: auth.currentUser.uid,
        startMileage: startMileage,
        endMileage: null,
        tripDate: new Date(),
        purpose: "Business",
        status: "in_progress",
      });
    },
    onSuccess: () => {
      console.log("Trip started successfully");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      refetch(); // Force a refetch
      toast({
        title: "Trip Started",
        description: "Your trip has been started. Don't forget to end it later!",
      });
    },
    onError: (error) => {
      console.error("Error starting trip:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start trip",
        variant: "destructive",
      });
    },
  });

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

  const handleStartTrip = () => {
    console.log("Start trip button clicked");
    startTripMutation.mutate();
  };

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

      {/* Quick Action Buttons */}
      <div className="grid gap-3">
        <Button 
          className="w-full flex justify-between" 
          variant={inProgressTrip ? "outline" : "default"}
          onClick={handleStartTrip}
          disabled={isLoading || startTripMutation.isPending || !!inProgressTrip}
        >
          <div className="flex items-center">
            <Play className="h-4 w-4 mr-2" />
            Start New Trip
          </div>
          {lastCompletedTrip && !inProgressTrip && (
            <Badge variant="outline">
              Start: {formatMileage(Number(lastCompletedTrip.endMileage))}
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
      
      {/* End Trip Dialog */}
      <EndTripDialog 
        open={showEndTripDialog} 
        onOpenChange={setShowEndTripDialog} 
        currentTrip={inProgressTrip || null} 
      />
    </div>
  );
} 