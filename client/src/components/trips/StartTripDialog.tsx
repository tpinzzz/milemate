import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { createTrip } from "@/lib/api";
import { type TripPurpose } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { formatMileage } from "@/lib/utils";

interface StartTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedStartMileage: number;
  purpose: TripPurpose;
  onSuccess?: () => void;
}

export default function StartTripDialog({ 
  open, 
  onOpenChange, 
  suggestedStartMileage,
  purpose,
  onSuccess 
}: StartTripDialogProps) {
  const [startMileage, setStartMileage] = useState(String(suggestedStartMileage));
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      setStartMileage(String(suggestedStartMileage));
    }
  });

  const startTripMutation = useMutation({
    mutationFn: async () => {
      if (!auth.currentUser?.uid) {
        throw new Error("No user ID");
      }

      const startMileageNum = Number(startMileage);
      if (isNaN(startMileageNum)) {
        throw new Error("Invalid mileage value");
      }

      console.log("Starting trip with data:", {
        userId: auth.currentUser.uid,
        startMileage: startMileageNum,
        purpose,
        status: "in_progress"
      });

      return createTrip({
        userId: auth.currentUser.uid,
        startMileage: startMileageNum,
        endMileage: null,
        tripDate: new Date(),
        purpose,
        status: "in_progress",
      });
    },
    onSuccess: () => {
      console.log("Trip started successfully");
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip Started",
        description: `Your ${purpose.toLowerCase()} trip has been started with ${formatMileage(Number(startMileage))} miles.`,
      });
      setStartMileage("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      console.error("Failed to start trip:", error);
      let errorMessage = "Failed to start trip";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'status' in error) {
        errorMessage = `Server error: ${(error as { status: number }).status}`;
      } else if (!navigator.onLine) {
        errorMessage = "No internet connection. Please check your network and try again.";
      }
      
      toast({
        title: "Error Starting Trip",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTripMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start New {purpose} Trip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="startMileage">Start Mileage</Label>
            <Input 
              id="startMileage" 
              type="number"
              value={startMileage}
              onChange={(e) => setStartMileage(e.target.value)}
              placeholder="Enter starting odometer reading"
              required
            />
            <p className="text-sm text-muted-foreground">
              Suggested: {formatMileage(suggestedStartMileage)} miles
              {suggestedStartMileage > 0 && " (based on last trip's end mileage)"}
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={startTripMutation.isPending || !startMileage}
            >
              {startTripMutation.isPending ? "Starting..." : "Start Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 