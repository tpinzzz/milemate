import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Trip } from "@shared/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMileage(mileage: number): string {
  return mileage.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

export function generateCsvData(trips: Trip[]): string {
  const headers = ["Date", "Start Mileage", "End Mileage", "Total Miles", "Purpose"];
  const rows = trips.map((trip) => [
    new Date(trip.tripDate).toLocaleDateString(),
    trip.startMileage.toString(),
    trip.endMileage.toString(),
    (Number(trip.endMileage) - Number(trip.startMileage)).toString(),
    trip.purpose,
  ]);

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
