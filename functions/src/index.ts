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
const corsHandler = cors({ origin: true });

// Test function to verify CORS is working
exports.testCors = functions.https.onRequest((request, response) => {
  corsHandler(request, response, () => {
    response.status(200).json({ message: "CORS is working correctly!" });
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
      if (request.method !== 'POST') {
        response.status(405).send('Method Not Allowed');
        return;
      }

      console.log("Received getTrips request body:", request.body);

      const userId = request.body.userId;
      if (!userId) {
        response.status(400).send('userId is required');
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

      console.log("Returning trips:", trips);
      response.status(200).json(trips);
    } catch (error) {
      console.error("Error fetching trips:", error);
      response.status(500).send('Internal Server Error');
    }
  });
});

// Create a new trip
exports.createTripHttp = functions.https.onRequest((request, response) => {
  console.log("createTripHttp called with method:", request.method);
  
  // Log headers for debugging
  console.log("Request headers:", request.headers);
  
  corsHandler(request, response, async () => {
    try {
      if (request.method !== 'POST') {
        console.log("Method not allowed:", request.method);
        response.status(405).send('Method Not Allowed');
        return;
      }

      console.log("Received request body:", JSON.stringify(request.body));
      
      try {
        // Check if request.body is empty or undefined
        if (!request.body || Object.keys(request.body).length === 0) {
          console.log("Request body is empty or undefined");
          response.status(400).send('Request body is required');
          return;
        }
        
        // Check if tripDate is a string and needs to be converted to a Date
        if (request.body.tripDate && typeof request.body.tripDate === 'string') {
          console.log("Converting tripDate from string to Date");
          request.body.tripDate = new Date(request.body.tripDate);
        }
        
        const tripData = insertTripSchema.parse(request.body);
        console.log("Parsed trip data:", tripData);
        
        // Create trip in Firestore with current timestamp
        const docRef = await db.collection("trips").add({
          ...tripData,
          createdAt: new Date() // Use JavaScript Date instead of Firestore timestamp
        });

        // Get the created trip
        const doc = await docRef.get();
        const createdData = doc.data();
        if (!createdData) {
          console.log("Failed to create trip: No data returned");
          response.status(500).send('Failed to create trip');
          return;
        }

        const trip = {
          id: (await db.collection("trips").count().get()).data().count + 1,
          ...createdData,
          tripDate: createdData.tripDate instanceof Date ? createdData.tripDate : new Date(createdData.tripDate),
          createdAt: createdData.createdAt instanceof Date ? createdData.createdAt : new Date(createdData.createdAt),
        };

        console.log("Trip created successfully:", trip);
        response.status(201).json(trip);
      } catch (parseError) {
        console.error("Schema validation error:", parseError);
        response.status(400).send(parseError instanceof Error ? parseError.message : 'Invalid trip data format');
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      response.status(500).send(error instanceof Error ? error.message : 'Internal server error');
    }
  });
});
