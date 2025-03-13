import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { getTrips, createTrip } from "@/lib/api";
import { type Trip } from "@/lib/types";
import { Download, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateCsvData } from "@/lib/utils";
import EndTripDialog from "./EndTripDialog";

export default function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showEndTripDialog, setShowEndTripDialog] = useState(false);

  // Query for any in-progress trip for the current user
  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      return getTrips(auth.currentUser.uid);
    },
    enabled: !!auth.currentUser?.uid,
  });

  const inProgressTrip = trips?.find(trip => trip.status === "in_progress");

  // Mutation for starting a new trip
  const startTripMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      
      // Get the last completed trip to use its end mileage as the new start mileage
      const lastCompletedTrip = trips
        ?.filter(trip => trip.status === "completed" && trip.endMileage !== null)
        .sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime())[0];
      
      const startMileage = lastCompletedTrip?.endMileage || 0;
      
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
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip Started",
        description: "Your trip has been started. Don't forget to end it later!",
      });
    },
    onError: (error) => {
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

  return (
    <>
      <div className="p-4 flex flex-col gap-2">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => startTripMutation.mutate()}
          disabled={isLoading || startTripMutation.isPending || !!inProgressTrip}
        >
          <Play className="h-4 w-4 mr-2" />
          Start New Trip
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => setShowEndTripDialog(true)}
          disabled={isLoading || !inProgressTrip}
        >
          <Square className="h-4 w-4 mr-2" />
          End Current Trip
        </Button>
        
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={handleExport}
          disabled={isLoading || !trips?.length}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Reports
        </Button>
      </div>
      
      <EndTripDialog 
        open={showEndTripDialog} 
        onOpenChange={setShowEndTripDialog} 
        currentTrip={inProgressTrip || null} 
      />
    </>
  );
} 