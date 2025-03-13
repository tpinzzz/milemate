import { getFunctions, httpsCallable } from 'firebase/functions';
import type { InsertTrip, Trip } from './types';

const functions = getFunctions();

export const getTrips = async (userId: string): Promise<Trip[]> => {
  const getTripsFunction = httpsCallable(functions, 'getTrips');
  const result = await getTripsFunction({ userId });
  return result.data as Trip[];
};

export const createTrip = async (tripData: InsertTrip): Promise<Trip> => {
  const createTripFunction = httpsCallable(functions, 'createTrip');
  const result = await createTripFunction(tripData);
  return result.data as Trip;
}; 