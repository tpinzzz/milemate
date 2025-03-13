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
export const getTrips = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "GET");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({message: "userId is required"});
      return;
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

    res.json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({message: "Failed to fetch trips"});
  }
});

// Create a new trip
export const createTrip = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") {
    // Send response to OPTIONS requests
    res.set("Access-Control-Allow-Methods", "POST");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.status(204).send("");
    return;
  }

  try {
    const tripData = insertTripSchema.parse(req.body);

    // Add timestamp
    const tripWithTimestamp = {
      ...tripData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create trip in Firestore
    const docRef = await db.collection("trips").add(tripWithTimestamp);

    // Get the created trip
    const doc = await docRef.get();
    const data = doc.data();
    if (!data) {
      throw new Error("Failed to create trip");
    }

    const trip = {
      id: (await db.collection("trips").count().get()).data().count + 1,
      ...data,
      tripDate: data.tripDate?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    };

    res.status(201).json(trip);
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(400).json({
      message: error instanceof Error ? error.message : "Invalid trip data",
    });
  }
});
