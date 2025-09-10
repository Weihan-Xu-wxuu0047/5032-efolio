const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.setUserRole = functions.https.onCall(async (data, context) => {
  try {
    // Validate input data
    const { uid, role } = data;
    
    if (!uid || typeof uid !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'User ID is required and must be a string'
      );
    }
    
    if (!role || !['member', 'organizer'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Role must be either "member" or "organizer"'
      );
    }




    await admin.auth().setCustomUserClaims(uid, { role });

    // Log the role assignment for debugging
    console.log(`Role "${role}" assigned to user ${uid}`);

    return { 
      success: true, 
      message: `Role "${role}" successfully assigned to user`,
      uid: uid,
      role: role
    };

  } catch (error) {
    console.error('Error setting user role:', error);
    

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    

    throw new functions.https.HttpsError(
      'internal',
      'Failed to set user role: ' + error.message
    );
  }
});

exports.getUserRole = functions.https.onCall(async (data, context) => {
  try {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const uid = context.auth.uid;
    const userRecord = await admin.auth().getUser(uid);
    
    return {
      uid: uid,
      role: userRecord.customClaims?.role || null,
      email: userRecord.email
    };

  } catch (error) {
    console.error('Error getting user role:', error);
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError(
      'internal',
      'Failed to get user role: ' + error.message
    );
  }
});
