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
import { type Trip } from "@/lib/types";
import { insertTripSchema, type InsertTrip } from "@/lib/schema";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrips, createTrip } from "@/lib/api";

export default function TripForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for any in-progress trip for the current user
  const { data: trips } = useQuery<Trip[]>({
    queryKey: ["trips", auth.currentUser?.uid],
    queryFn: async () => {
      if (!auth.currentUser?.uid) throw new Error("No user ID");
      return getTrips(auth.currentUser.uid);
    },
    enabled: !!auth.currentUser?.uid,
  });

  const inProgressTrip = trips?.find(trip => trip.status === "in_progress");

  const form = useForm<InsertTrip>({
    resolver: zodResolver(insertTripSchema),
    defaultValues: {
      startMileage: inProgressTrip?.startMileage || "0",
      tripDate: inProgressTrip?.tripDate ? new Date(inProgressTrip.tripDate) : new Date(),
      purpose: (inProgressTrip?.purpose || "Business") as "Business" | "Personal",
      userId: auth.currentUser?.uid || "",
      status: inProgressTrip ? "completed" : "in_progress",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertTrip) => {
      return createTrip(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });

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
          startMileage: "0",
          tripDate: new Date(),
          purpose: "Business",
          userId: auth.currentUser?.uid || "",
          status: "in_progress",
        });
      }
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
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                        "w-[240px] pl-3 text-left font-normal",
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

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trip Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save Trip"}
        </Button>
      </form>
    </Form>
  );
}