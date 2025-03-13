export type TripPurpose = "Business" | "Personal";
export type TripStatus = "in_progress" | "completed";

export interface InsertTrip {
  userId: string;
  startMileage: string;
  endMileage: string | null;
  tripDate: Date;
  purpose: TripPurpose;
  status: TripStatus;
}

export interface Trip extends InsertTrip {
  id: number;
  createdAt: Date;
} 