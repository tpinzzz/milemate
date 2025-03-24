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
// Import cors as a default import
import cors from "cors";

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

// Initialize cors middleware
const corsHandler = cors({
  origin: true,
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Test function to verify CORS is working
exports.testCors = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.status(200).json({message: "CORS is working correctly!"});
  });
});

exports.apiFunction = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.status(200).send("CORS enabled function response");
  });
});

// Get all trips for a user
exports.getTripsHttp = functions.https.onRequest((request, response) => {
  corsHandler(request, response, async () => {
    try {
      if (request.method !== "POST") {
        response.status(405).send("Method Not Allowed");
        return;
      }

      console.log("Received getTrips request body:", request.body);

      const userId = request.body.userId;
      if (!userId) {
        response.status(400).send("userId is required");
        return;
      }

      // Query Firestore for trips
      const tripsSnapshot = await db.collection("trips")
        .where("userId", "==", userId)
        .orderBy("tripDate", "desc")
        .get();

      const trips = tripsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id, // Use document ID instead of index+1
          ...data,
          tripDate: data.tripDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });

      console.log("Returning trips:", trips);
      response.status(200).json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      response.status(500).send("Internal Server Error");
    }
  });
});

// Create a new trip
exports.createTripHttp = functions.https.onRequest((request, response) => {
  console.log("createTripHttp called with method:", request.method);
  console.log("Request origin:", request.headers.origin);
  console.log("Request headers:", request.headers);

  corsHandler(request, response, async () => {
    try {
      if (request.method !== "POST") {
        console.log("Method not allowed:", request.method);
        response.status(405).json({error: "Method Not Allowed"});
        return;
      }

      console.log("Received request body:", JSON.stringify(request.body, null, 2));

      // Check if request.body is empty or undefined
      if (!request.body || Object.keys(request.body).length === 0) {
        console.log("Request body is empty or undefined");
        response.status(400).json({error: "Request body is required"});
        return;
      }

      // Validate userId exists
      if (!request.body.userId) {
        console.log("Missing userId in request");
        response.status(400).json({error: "userId is required"});
        return;
      }

      // Convert string mileage values to numbers if needed
      const processedBody = {
        ...request.body,
        startMileage: Number(request.body.startMileage),
        endMileage: request.body.endMileage ? Number(request.body.endMileage) : null,
      };

      // Check if tripDate is a string and needs to be converted to a Date
      if (processedBody.tripDate && typeof processedBody.tripDate === "string") {
        console.log("Converting tripDate from string to Date");
        processedBody.tripDate = new Date(processedBody.tripDate);
      }

      try {
        const tripData = insertTripSchema.parse(processedBody);
        console.log("Parsed trip data:", tripData);

        // Create new trip in Firestore with current timestamp
        const docRef = await db.collection("trips").add({
          ...tripData,
          createdAt: new Date(),
        });

        // Get the created trip
        const doc = await docRef.get();
        const createdData = doc.data();
        if (!createdData) {
          console.log("Failed to create trip: No data returned");
          response.status(500).json({error: "Failed to create trip: No data returned"});
          return;
        }

        const trip = {
          id: doc.id,
          ...createdData,
          tripDate: createdData.tripDate instanceof Date ? createdData.tripDate : new Date(createdData.tripDate),
          createdAt: createdData.createdAt instanceof Date ? createdData.createdAt : new Date(createdData.createdAt),
        };

        console.log("Trip created successfully:", trip);
        response.status(201).json(trip);
      } catch (parseError) {
        console.error("Schema validation error:", parseError);
        response.status(400).json({
          error: "Invalid trip data format",
          details: parseError instanceof Error ? parseError.message : "Unknown validation error",
        });
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      response.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
});
