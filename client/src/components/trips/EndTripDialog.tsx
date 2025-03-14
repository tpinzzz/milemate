import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/firebase";
import { createTrip } from "@/lib/api";
import { type Trip } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { calculateTripDetails, formatMileage } from "@/lib/utils";

interface EndTripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTrip: Trip | null;
}

export default function EndTripDialog({ open, onOpenChange, currentTrip }: EndTripDialogProps) {
  const [endMileage, setEndMileage] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const endTripMutation = useMutation({
    mutationFn: async () => {
      if (!currentTrip || !auth.currentUser?.uid) {
        throw new Error("No in-progress trip or user ID");
      }
      
      const endMileageNum = Number(endMileage);
      if (isNaN(endMileageNum) || endMileageNum <= Number(currentTrip.startMileage)) {
        throw new Error("End mileage must be greater than start mileage");
      }
      
      return createTrip({
        userId: auth.currentUser.uid,
        startMileage: currentTrip.startMileage,
        endMileage: endMileageNum,
        tripDate: new Date(currentTrip.tripDate),
        purpose: currentTrip.purpose,
        status: "completed",
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      
      // Calculate and show tax deduction
      const startMileage = Number(currentTrip?.startMileage || 0);
      const endMileageNum = Number(endMileage);
      const { miles, deduction } = calculateTripDetails(startMileage, endMileageNum);
      
      toast({
        title: "Trip Completed",
        description: (
          <div className="mt-2 space-y-2">
            <p>Miles driven: {formatMileage(miles)}</p>
            <p>Estimated tax deduction: ${deduction.toFixed(2)}</p>
          </div>
        ),
      });
      
      // Reset form and close dialog
      setEndMileage("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to end trip",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    endTripMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>End Current Trip</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="startMileage">Start Mileage</Label>
            <Input 
              id="startMileage" 
              value={currentTrip?.startMileage || ""} 
              disabled 
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="endMileage">End Mileage</Label>
            <Input 
              id="endMileage" 
              type="number" 
              value={endMileage} 
              onChange={(e) => setEndMileage(e.target.value)}
              placeholder="Enter ending odometer reading"
              required
            />
            <p className="text-sm text-muted-foreground">
              Must be greater than start mileage
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
              disabled={endTripMutation.isPending || !endMileage}
            >
              {endTripMutation.isPending ? "Saving..." : "End Trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 