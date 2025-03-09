import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn, calculateTripDetails, formatMileage } from "@/lib/utils";
import { insertTripSchema, type InsertTrip, type Trip } from "@shared/schema";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TripForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for any in-progress trip for the current user
  const { data: trips } = useQuery<Trip[]>({
    queryKey: ["/api/trips", auth.currentUser?.uid],
    queryFn: async () => {
      const response = await fetch(`/api/trips?userId=${auth.currentUser?.uid}`);
      if (!response.ok) {
        throw new Error("Failed to fetch trips");
      }
      return response.json();
    },
    enabled: !!auth.currentUser?.uid,
  });

  const inProgressTrip = trips?.find(trip => trip.status === "in_progress");

  const form = useForm<InsertTrip>({
    resolver: zodResolver(insertTripSchema),
    defaultValues: {
      startMileage: inProgressTrip?.startMileage ? Number(inProgressTrip.startMileage) : 0,
      tripDate: inProgressTrip?.tripDate ? new Date(inProgressTrip.tripDate) : new Date(),
      purpose: inProgressTrip?.purpose || "Business",
      userId: auth.currentUser?.uid || "",
      status: inProgressTrip ? "completed" : "in_progress",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTrip) => {
      await apiRequest("POST", "/api/trips", data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trips"] });

      // Show completion message with tax deduction if ending trip
      if (variables.status === "completed" && variables.endMileage) {
        const { miles, deduction } = calculateTripDetails(
          Number(variables.startMileage),
          Number(variables.endMileage)
        );

        toast({
          title: "Trip Completed",
          description: (
            <div className="mt-2 space-y-2">
              <p>Miles driven: {formatMileage(miles)}</p>
              <p>Estimated tax deduction: ${deduction.toFixed(2)}</p>
            </div>
          ),
        });
      } else {
        // Show message for starting trip
        toast({
          title: "Trip Started",
          description: "Your trip has been started. Don't forget to end it later!",
        });
      }

      // Only reset form if completing the trip
      if (variables.status === "completed") {
        form.reset({
          startMileage: 0,
          tripDate: new Date(),
          purpose: "Business",
          userId: auth.currentUser?.uid || "",
          status: "in_progress",
        });
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save trip. Please try again.",
      });
    },
  });

  const onSubmit = (data: InsertTrip) => {
    // Ensure userId is set from current auth state
    data.userId = auth.currentUser?.uid || "";

    if (inProgressTrip) {
      // If ending trip, validate end mileage
      if (!data.endMileage || data.endMileage <= Number(inProgressTrip.startMileage)) {
        toast({
          variant: "destructive",
          title: "Invalid end mileage",
          description: "End mileage must be greater than start mileage.",
        });
        return;
      }
      data.status = "completed";
      // Keep the original start mileage
      data.startMileage = Number(inProgressTrip.startMileage);
    }

    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="startMileage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Mileage</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.1" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    disabled={!!inProgressTrip} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {inProgressTrip && (
            <FormField
              control={form.control}
              name="endMileage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Mileage</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tripDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
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
                <FormLabel>Purpose</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <input type="hidden" {...field} />
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={mutation.isPending}
        >
          {mutation.isPending 
            ? "Saving..." 
            : inProgressTrip 
              ? "End Trip" 
              : "Start Trip"}
        </Button>
      </form>
    </Form>
  );
}