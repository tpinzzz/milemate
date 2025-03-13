import { getFunctions, httpsCallable } from 'firebase/functions';
import type { InsertTrip, Trip } from './types';
import { functions } from './firebase';

export const getTrips = async (userId: string): Promise<Trip[]> => {
  const getTripsFunction = httpsCallable<{ userId: string }, Trip[]>(functions, 'getTrips');
  const result = await getTripsFunction({ userId });
  return result.data;
};

export const createTrip = async (tripData: InsertTrip): Promise<Trip> => {
  const createTripFunction = httpsCallable<InsertTrip, Trip>(functions, 'createTrip');
  const result = await createTripFunction(tripData);
  return result.data;
}; 