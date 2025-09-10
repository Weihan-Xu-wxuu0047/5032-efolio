import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  getIdTokenResult
} from 'firebase/auth';
import { auth } from '../firebase.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.currentRole = null;
    this.authStateListeners = [];
    
    // Listen to auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      
      if (user) {
        try {
          // Try to get role from localStorage first (temporary solution)
          const storedRoleData = localStorage.getItem(`userRole_${user.uid}`);
          if (storedRoleData) {
            const roleData = JSON.parse(storedRoleData);
            this.currentRole = roleData.role;
          } else {
            // Fallback to checking custom claims (for future Cloud Functions implementation)
            const tokenResult = await getIdTokenResult(user);
            this.currentRole = tokenResult.claims.role || null;
          }
        } catch (error) {
          console.error('Error getting user role:', error);
          this.currentRole = null;
        }
      } else {
        this.currentRole = null;
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(callback => {
        callback(this.currentUser, this.currentRole);
      });
    });
  }

  // Register a new user with role
  async register(email, password, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // For now, store role in localStorage (temporary solution)
      // In production, this should be done via Cloud Functions
      const userRoleData = {
        uid: userCredential.user.uid,
        role: role,
        email: email
      };
      
      localStorage.setItem(`userRole_${userCredential.user.uid}`, JSON.stringify(userRoleData));
      this.currentRole = role;
      
      return {
        user: userCredential.user,
        role: role
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Login user with role validation
  async login(email, password, expectedRole) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get role from localStorage (temporary solution)
      const storedRoleData = localStorage.getItem(`userRole_${userCredential.user.uid}`);
      
      if (!storedRoleData) {
        throw new Error('No role found on account. Please register again or contact support.');
      }
      
      const roleData = JSON.parse(storedRoleData);
      const userRole = roleData.role;
      
      // Check if user has the expected role
      if (!this.hasRole(userRole, expectedRole)) {
        throw new Error(`This account does not have ${expectedRole} access. Please use the correct login portal.`);
      }
      
      this.currentRole = expectedRole; // Set the role they're logging in as
      
      return {
        user: userCredential.user,
        role: expectedRole
      };
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Check if user has a specific role (supports multiple roles)
  hasRole(userRoles, requiredRole) {
    if (typeof userRoles === 'string') {
      return userRoles === requiredRole;
    }
    if (Array.isArray(userRoles)) {
      return userRoles.includes(requiredRole);
    }
    return false;
  }

  // Logout user
  async logout() {
    try {
      // Clear role data from localStorage
      if (this.currentUser) {
        localStorage.removeItem(`userRole_${this.currentUser.uid}`);
      }
      
      await signOut(auth);
      this.currentUser = null;
      this.currentRole = null;
    } catch (error) {
      throw new Error(this.getErrorMessage(error));
    }
  }

  // Get current user info
  getCurrentUser() {
    return {
      user: this.currentUser,
      role: this.currentRole
    };
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Check if user has specific role
  hasCurrentRole(role) {
    return this.currentRole === role;
  }

  // Add auth state listener
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
    };
  }

  // Get user-friendly error messages
  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;
