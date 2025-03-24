import {z} from "zod";

export const insertTripSchema = z.object({
  userId: z.string(),
  startMileage: z.number(),
  endMileage: z.number().nullable(),
  tripDate: z.union([
    z.string().transform((val) => new Date(val)),
    z.date(),
  ]),
  purpose: z.enum(["Business", "Personal"] as const),
  status: z.enum(["in_progress", "completed"] as const),
});

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = InsertTrip & {
  id: number;
  createdAt: Date;
};
