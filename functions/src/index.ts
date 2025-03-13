/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {insertTripSchema} from "./schema";

// Initialize Firebase Admin
admin.initializeApp();

// Get Firestore instance
const db = admin.firestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Get all trips for a user
export const getTrips = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new Error("Authentication required");
    }

    const userId = data.userId;
    if (!userId) {
      throw new Error("userId is required");
    }

    // Query Firestore for trips
    const tripsSnapshot = await db.collection("trips")
      .where("userId", "==", userId)
      .orderBy("tripDate", "desc")
      .get();

    const trips = tripsSnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1, // Generate numeric IDs
        ...data,
        tripDate: data.tripDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    return trips;
  } catch (error) {
    console.error("Error fetching trips:", error);
    throw new functions.https.HttpsError(
      "internal",
      error instanceof Error ? error.message : "Failed to fetch trips"
    );
  }
});

// Create a new trip
export const createTrip = functions.https.onCall(async (data, context) => {
  try {
    // Ensure user is authenticated
    if (!context.auth) {
      throw new Error("Authentication required");
    }

    const tripData = insertTripSchema.parse(data);

    // Add timestamp
    const tripWithTimestamp = {
      ...tripData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create trip in Firestore
    const docRef = await db.collection("trips").add(tripWithTimestamp);

    // Get the created trip
    const doc = await docRef.get();
    const createdData = doc.data();
    if (!createdData) {
      throw new Error("Failed to create trip");
    }

    const trip = {
      id: (await db.collection("trips").count().get()).data().count + 1,
      ...createdData,
      tripDate: createdData.tripDate?.toDate() || new Date(),
      createdAt: createdData.createdAt?.toDate() || new Date(),
    };

    return trip;
  } catch (error) {
    console.error("Error creating trip:", error);
    throw new functions.https.HttpsError(
      "invalid-argument",
      error instanceof Error ? error.message : "Invalid trip data"
    );
  }
});
