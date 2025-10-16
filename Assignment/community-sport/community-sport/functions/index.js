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
 * Cloud Function to get user appointments from Firestore
 * Retrieves all appointments for a specific user email
 */
exports.getUserAppointments = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Getting user appointments", { data: request.data });

    // Validate required fields
    const { user_email } = request.data;
    if (!user_email) {
      throw new Error("User email is required");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Query appointments for the user
    const appointmentsQuery = db.collection("appointments")
      .where("user_email", "==", user_email);

    const querySnapshot = await appointmentsQuery.get();
    const appointments = [];

    logger.info("Found appointments", { count: querySnapshot.docs.length });

    for (const doc of querySnapshot.docs) {
      const appointmentData = { id: doc.id, ...doc.data() };
      
      // Skip cancelled appointments
      if (appointmentData.status === "cancelled") {
        logger.info("Skipping cancelled appointment", { appointmentId: doc.id });
        continue;
      }
      
      logger.info("Processing appointment", { 
        appointmentId: doc.id, 
        programId: appointmentData.program_id 
      });
      
      // Get program details for each appointment
      try {
        if (appointmentData.program_id) {
          logger.info("Fetching program details", { programId: appointmentData.program_id });
          const programDoc = await db.collection("programs").doc(appointmentData.program_id).get();
          
          if (programDoc.exists) {
            const programData = programDoc.data();
            appointmentData.program = { id: programDoc.id, ...programData };
            logger.info("Successfully added program details", { 
              programId: appointmentData.program_id,
              programTitle: programData.title,
              programSport: programData.sport
            });
          } else {
            logger.warn("Program document not found", { programId: appointmentData.program_id });
            // Add placeholder program data
            appointmentData.program = {
              id: appointmentData.program_id,
              title: `Program ${appointmentData.program_id}`,
              sport: 'Unknown Sport'
            };
          }
        } else {
          logger.warn("Appointment missing program_id", { appointmentId: doc.id });
          appointmentData.program = {
            id: 'unknown',
            title: 'Unknown Program',
            sport: 'Unknown Sport'
          };
        }
      } catch (programError) {
        logger.error("Error fetching program details", { 
          programId: appointmentData.program_id, 
          error: programError.message,
          stack: programError.stack 
        });
        // Add placeholder program data on error
        appointmentData.program = {
          id: appointmentData.program_id || 'error',
          title: 'Error Loading Program',
          sport: 'Unknown Sport'
        };
      }
      
      appointments.push(appointmentData);
    }

    // Sort appointments by creation date (client-side since we removed orderBy)
    appointments.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime - aTime;
    });

    logger.info("User appointments retrieved successfully", { count: appointments.length });

    return {
      success: true,
      appointments: appointments,
      count: appointments.length
    };

  } catch (error) {
    logger.error("Error getting user appointments", { 
      error: error.message, 
      stack: error.stack,
      code: error.code 
    });
    throw new Error(`Failed to get appointments: ${error.message}`);
  }
});

/**
 * Cloud Function to update an existing appointment in Firestore
 * Updates appointment time slots and other details
 */
exports.updateAppointment = onCall(async (request) => {
  try {
    // Log the incoming request for debugging
    logger.info("Updating appointment", { data: request.data });

    // Validate required fields
    const { appointment_id, time_slot, user_email } = request.data;
    if (!appointment_id || !time_slot || !user_email) {
      throw new Error("Appointment ID, time slots, and user email are required");
    }

    // Validate time_slot array
    if (!Array.isArray(time_slot) || time_slot.length === 0) {
      throw new Error("At least one time slot must be selected");
    }

    // Get Firestore instance
    const db = admin.firestore();

    // Get the existing appointment to verify ownership
    const appointmentRef = db.collection("appointments").doc(appointment_id);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists()) {
      throw new Error("Appointment not found");
    }

    const existingAppointment = appointmentDoc.data();
    
    // Verify the user owns this appointment
    if (existingAppointment.user_email !== user_email) {
      throw new Error("You can only update your own appointments");
    }

    // Update the appointment
    const updateData = {
      time_slot: time_slot,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await appointmentRef.update(updateData);

    logger.info("Appointment updated successfully", { appointmentId: appointment_id });

    return {
      success: true,
      appointmentId: appointment_id,
      message: "Appointment updated successfully"
    };

  } catch (error) {
    logger.error("Error updating appointment", { error: error.message });
    throw new Error(`Failed to update appointment: ${error.message}`);
  }
});

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

    // Prepare the appointment data with auto-generated ID explicitly included
    const appointmentToSave = {
      id: appointmentId, // Add standard id field for consistency
      appointment_id: appointmentId, // Keep the original field name as specified
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

    // Prepare the program data with auto-generated ID explicitly included
    const programToSave = {
      id: programId, // Explicitly include the ID in the document data
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

// Cancel Appointment Function
exports.cancelAppointment = onCall(async (request) => {
  try {
    const { appointmentId, userEmail } = request.data;

    // Validate input
    if (!appointmentId || !userEmail) {
      throw new Error("Missing required fields: appointmentId and userEmail are required");
    }

    logger.info("Canceling appointment", { appointmentId, userEmail });

    // Get Firestore instance
    const db = admin.firestore();

    // Get the appointment document
    const appointmentRef = db.collection("appointments").doc(appointmentId);
    const appointmentDoc = await appointmentRef.get();

    if (!appointmentDoc.exists) {
      throw new Error("Appointment not found");
    }

    const appointmentData = appointmentDoc.data();

    // Verify ownership - user can only cancel their own appointments
    if (appointmentData.user_email !== userEmail) {
      throw new Error("You can only cancel your own appointments");
    }

    // Check if appointment is already cancelled
    if (appointmentData.status === "cancelled") {
      throw new Error("Appointment is already cancelled");
    }

    // Update appointment status to cancelled instead of deleting
    // This preserves the record for audit purposes
    await appointmentRef.update({
      status: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info("Appointment cancelled successfully", { 
      appointmentId, 
      userEmail,
      programId: appointmentData.program_id 
    });

    return {
      success: true,
      message: "Appointment cancelled successfully",
      appointmentId: appointmentId
    };

  } catch (error) {
    logger.error("Error cancelling appointment", { 
      error: error.message,
      appointmentId: request.data?.appointmentId,
      userEmail: request.data?.userEmail
    });
    
    throw new Error(`Failed to cancel appointment: ${error.message}`);
  }
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
