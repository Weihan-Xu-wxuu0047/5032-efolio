/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function to create a new appointment in Firestore
 * Receives appointment data from frontend and stores it in the appointments collection
 */
exports.createAppointment = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Creating new appointment", { data: request.data });

    // Validate required fields
    const appointmentData = request.data;
    if (!appointmentData) {
      throw new Error("Appointment data is required");
    }

    // Validate required fields
    const requiredFields = ["program_id", "user_email", "time_slot"];
    for (const field of requiredFields) {
      if (!appointmentData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate time_slot array
    if (!Array.isArray(appointmentData.time_slot) || appointmentData.time_slot.length === 0) {
      throw new Error("At least one time slot must be selected");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Create a new document reference with auto-generated ID
    const appointmentRef = db.collection("appointments").doc();
    const appointmentId = appointmentRef.id;

    // Prepare the appointment data with auto-generated ID
    const appointmentToSave = {
      appointment_id: appointmentId,
      program_id: appointmentData.program_id,
      user_email: appointmentData.user_email,
      time_slot: appointmentData.time_slot,
      status: "confirmed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save the appointment to Firestore
    await appointmentRef.set(appointmentToSave);

    logger.info("Appointment created successfully", { appointmentId: appointmentId });

    // Return success response with the appointment ID
    return {
      success: true,
      appointmentId: appointmentId,
      message: "Appointment booked successfully"
    };

  } catch (error) {
    logger.error("Error creating appointment", { error: error.message });
    
    // Return error response
    throw new Error(`Failed to create appointment: ${error.message}`);
  }
});

/**
 * Cloud Function to create a new program in Firestore
 * Receives program data from frontend and stores it in the programs collection
 */
exports.createProgram = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Creating new program", { data: request.data });

    // Validate required fields
    const programData = request.data;
    if (!programData) {
      throw new Error("Program data is required");
    }

    // Validate required fields
    const requiredFields = ["title", "sport", "organizer_email", "description", "ageGroups", "cost", "costUnit"];
    for (const field of requiredFields) {
      if (!programData[field] && programData[field] !== 0) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Create a new document reference with auto-generated ID
    const programRef = db.collection("programs").doc();
    const programId = programRef.id;

    // Prepare the program data with auto-generated ID
    const programToSave = {
      id: programId,
      title: programData.title,
      sport: programData.sport,
      organizer_email: programData.organizer_email,
      description: programData.description,
      ageGroups: programData.ageGroups || [],
      cost: Number(programData.cost),
      costUnit: programData.costUnit,
      accessibility: programData.accessibility || [],
      inclusivityTags: programData.inclusivityTags || [],
      schedule: programData.schedule || [],
      venue: programData.venue || {},
      equipment: programData.equipment || { provided: false, required: [] },
      contact: programData.contact || {},
      images: programData.images || [],
      maxParticipants: Number(programData.maxParticipants),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "active" // Default status
    };

    // Save the program to Firestore
    await programRef.set(programToSave);

    logger.info("Program created successfully", { programId: programId });

    // Return success response with the program ID
    return {
      success: true,
      programId: programId,
      message: "Program created successfully"
    };

  } catch (error) {
    logger.error("Error creating program", { error: error.message });
    
    // Return error response
    throw new Error(`Failed to create program: ${error.message}`);
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
