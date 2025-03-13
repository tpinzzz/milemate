import { z } from 'zod';
import type { TripPurpose, TripStatus } from './types';

export const insertTripSchema = z.object({
  userId: z.string(),
  startMileage: z.string().transform(val => Number(val)),
  endMileage: z.string().nullable().transform(val => val ? Number(val) : null),
  tripDate: z.date(),
  purpose: z.enum(['Business', 'Personal'] as const),
  status: z.enum(['in_progress', 'completed'] as const),
});

export type InsertTrip = z.infer<typeof insertTripSchema>; 