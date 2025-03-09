import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  startMileage: numeric("start_mileage").notNull(),
  endMileage: numeric("end_mileage"),
  tripDate: timestamp("trip_date").notNull(),
  purpose: text("purpose").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTripSchema = createInsertSchema(trips)
  .pick({
    userId: true,
    startMileage: true,
    endMileage: true,
    tripDate: true,
    purpose: true,
    status: true,
  })
  .extend({
    startMileage: z.number().positive(),
    endMileage: z.number().positive().optional(),
    tripDate: z.coerce.date(),
    purpose: z.enum(["Business", "Personal"]),
    status: z.enum(["in_progress", "completed"]),
  });

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;