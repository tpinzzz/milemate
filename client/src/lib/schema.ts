import { z } from 'zod';
import type { TripPurpose, TripStatus } from './types';

export const insertTripSchema = z.object({
  userId: z.string(),
  startMileage: z.string(),
  endMileage: z.string().nullable(),
  tripDate: z.date(),
  purpose: z.enum(['Business', 'Personal'] as const),
  status: z.enum(['in_progress', 'completed'] as const),
});

export type InsertTrip = z.infer<typeof insertTripSchema>; 