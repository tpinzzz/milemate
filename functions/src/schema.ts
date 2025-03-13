import {z} from "zod";

export const insertTripSchema = z.object({
  userId: z.string(),
  startMileage: z.union([z.string(), z.number()]),
  endMileage: z.union([z.string(), z.number(), z.null()]),
  tripDate: z.union([
    z.string().transform(val => new Date(val)),
    z.date()
  ]),
  purpose: z.enum(["Business", "Personal"] as const),
  status: z.enum(["in_progress", "completed"] as const),
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = InsertTrip & {
  id: number;
  createdAt: Date;
};
