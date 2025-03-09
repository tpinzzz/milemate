import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Trip } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MILEAGE_RATE = 0.70;

export function formatMileage(mileage: number): string {
  return mileage.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function calculateTripDetails(startMileage: number, endMileage: number) {
  const totalMiles = endMileage - startMileage;
  const taxDeduction = totalMiles * MILEAGE_RATE;
  return {
    miles: totalMiles,
    deduction: taxDeduction,
  };
}

export function generateCsvData(trips: Trip[]): string {
  const headers = ["Date", "Start Mileage", "End Mileage", "Total Miles", "Purpose", "Tax Deduction"];
  const rows = trips.map((trip) => {
    const totalMiles = Number(trip.endMileage) - Number(trip.startMileage);
    return [
      new Date(trip.tripDate).toLocaleDateString(),
      trip.startMileage.toString(),
      trip.endMileage?.toString() || "",
      totalMiles.toString(),
      trip.purpose,
      trip.endMileage ? `$${(totalMiles * MILEAGE_RATE).toFixed(2)}` : "",
    ];
  });

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}