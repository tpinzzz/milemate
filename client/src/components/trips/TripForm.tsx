import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn, calculateTripDetails, formatMileage } from "@/lib/utils";
import { type Trip } from "@/lib/types";
import { insertTripSchema, type InsertTrip } from "@/lib/schema";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrips, createTrip } from "@/lib/api";

export default function TripForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for trips to get the latest mileage
  const { data: trips } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      return getTrips(auth.currentUser.uid);
    },
    enabled: !!auth.currentUser?.uid,
  });

  // Get the last completed trip to suggest a start mileage
  const lastCompletedTrip = trips
    ?.filter(trip => trip.status === "completed" && trip.endMileage !== null)
    .sort((a, b) => new Date(b.tripDate).getTime() - new Date(a.tripDate).getTime())[0];

  // Convert to string for the form
  const suggestedStartMileage = lastCompletedTrip?.endMileage !== null 
    ? String(lastCompletedTrip?.endMileage) 
    : "0";

  const form = useForm<InsertTrip>({
    resolver: zodResolver(insertTripSchema),
    defaultValues: {
      startMileage: suggestedStartMileage,
      endMileage: "",
      tripDate: new Date(),
      purpose: "Business",
      userId: auth.currentUser?.uid || "",
      status: "completed", // Always completed
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTrip) => {
      // Ensure status is always completed
      return createTrip({
        ...data,
        status: "completed"
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });

      // Show completion message with tax deduction
      const { miles, deduction } = calculateTripDetails(
        Number(variables.startMileage),
        Number(variables.endMileage)
      );

      toast({
        title: "Trip Saved",
        description: (
          <div className="mt-2 space-y-2">
            <p>Miles driven: {formatMileage(miles)}</p>
            <p>Estimated tax deduction: ${deduction.toFixed(2)}</p>
          </div>
        ),
      });

      // Reset form with the new end mileage as the suggested start mileage
      form.reset({
        startMileage: String(variables.endMileage),
        endMileage: "",
        tripDate: new Date(),
        purpose: "Business",
        userId: auth.currentUser?.uid || "",
        status: "completed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save trip",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTrip) => {
    // Validate that end mileage is greater than start mileage
    const startMileage = Number(data.startMileage);
    const endMileage = Number(data.endMileage);
    
    if (endMileage <= startMileage) {
      form.setError("endMileage", { 
        type: "manual", 
        message: "End mileage must be greater than start mileage" 
      });
      return;
    }
    
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="startMileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endMileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Mileage</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                    required
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="tripDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Trip Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Purpose</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Hidden status field - always completed */}
        <input type="hidden" {...form.register("status")} value="completed" />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Saving..." : "Save Completed Trip"}
        </Button>
      </form>
    </Form>
  );
}