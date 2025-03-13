import { getFunctions, httpsCallable } from 'firebase/functions';
import type { InsertTrip, Trip } from './types';
import { functions } from './firebase';

// Base URL for Firebase Functions
const FUNCTIONS_BASE_URL = 'http://localhost:5001/milemate-6cba7/us-central1';

export const getTrips = async (userId: string): Promise<Trip[]> => {
  console.log("Calling getTrips with userId:", userId);
  try {
    // Use fetch API to call the HTTP endpoint
    const response = await fetch(`${FUNCTIONS_BASE_URL}/getTripsHttp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("getTrips result:", data);
    return data;
  } catch (error) {
    console.error("Error in getTrips:", error);
    throw error;
  }
};

export const createTrip = async (tripData: InsertTrip): Promise<Trip> => {
  console.log("Calling createTrip with data:", tripData);
  try {
    // Use fetch API to call the HTTP endpoint
    const response = await fetch(`${FUNCTIONS_BASE_URL}/createTripHttp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("createTrip result:", data);
    return data;
  } catch (error) {
    console.error("Error in createTrip:", error);
    throw error;
  }
}; 