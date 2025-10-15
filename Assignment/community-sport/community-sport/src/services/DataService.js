import { 
  collection, 
  doc, 
  getDocs, 
  getDoc
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase.js';

class DataService {
  constructor() {
    this.programsCache = null;
    this.faqsCache = null;
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.programsCacheTime = null;
    this.faqsCacheTime = null;
  }

  // Check if cache is still valid
  isCacheValid(cacheTime) {
    return cacheTime && (Date.now() - cacheTime < this.cacheExpiry);
  }

  // Get all programs from Firestore
  async getPrograms() {
    try {
      // Return cached data if still valid
      if (this.programsCache && this.isCacheValid(this.programsCacheTime)) {
        return this.programsCache;
      }

      console.log('Fetching programs from Firestore...');
      const programsRef = collection(db, 'programs');
      const querySnapshot = await getDocs(programsRef);
      
      const programs = [];
      querySnapshot.forEach((doc) => {
        programs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Cache the results
      this.programsCache = programs;
      this.programsCacheTime = Date.now();

      console.log(`Loaded ${programs.length} programs from Firestore`);
      return programs;
    } catch (error) {
      console.error('Error fetching programs from Firestore:', error);
      throw new Error('Failed to load programs. Please try again later.');
    }
  }

  // Get a single program by ID
  async getProgram(programId) {
    try {
      // First try to get from cache
      if (this.programsCache && this.isCacheValid(this.programsCacheTime)) {
        const program = this.programsCache.find(p => p.id === programId);
        if (program) {
          return program;
        }
      }

      console.log(`Fetching program ${programId} from Firestore...`);
      const programRef = doc(db, 'programs', programId);
      const programDoc = await getDoc(programRef);
      
      if (programDoc.exists()) {
        return {
          id: programDoc.id,
          ...programDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching program from Firestore:', error);
      throw new Error('Failed to load program details. Please try again later.');
    }
  }

  // Get all FAQs from Firestore
  async getFaqs() {
    try {
      // Return cached data if still valid
      if (this.faqsCache && this.isCacheValid(this.faqsCacheTime)) {
        return this.faqsCache;
      }

      console.log('Fetching FAQs from Firestore...');
      const faqsRef = collection(db, 'faqs');
      const querySnapshot = await getDocs(faqsRef);
      
      const faqs = [];
      querySnapshot.forEach((doc) => {
        faqs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Cache the results
      this.faqsCache = faqs;
      this.faqsCacheTime = Date.now();

      console.log(`Loaded ${faqs.length} FAQs from Firestore`);
      return faqs;
    } catch (error) {
      console.error('Error fetching FAQs from Firestore:', error);
      throw new Error('Failed to load FAQs. Please try again later.');
    }
  }

  // Get unique sport options from programs
  async getSportOptions() {
    try {
      const programs = await this.getPrograms();
      const sports = [...new Set(programs.map(p => p.sport))].filter(Boolean);
      return sports.sort();
    } catch (error) {
      console.error('Error getting sport options:', error);
      return [];
    }
  }

  // Get unique age group options from programs
  async getAgeGroupOptions() {
    try {
      const programs = await this.getPrograms();
      const ageGroups = new Set();
      
      programs.forEach(program => {
        if (program.ageGroups && Array.isArray(program.ageGroups)) {
          program.ageGroups.forEach(age => ageGroups.add(age));
        }
      });
      
      return [...ageGroups].sort();
    } catch (error) {
      console.error('Error getting age group options:', error);
      return [];
    }
  }

  // Get unique accessibility options from programs
  async getAccessibilityOptions() {
    try {
      const programs = await this.getPrograms();
      const accessibilityFeatures = new Set();
      
      programs.forEach(program => {
        if (program.accessibility && Array.isArray(program.accessibility)) {
          program.accessibility.forEach(feature => accessibilityFeatures.add(feature));
        }
      });
      
      // Map to user-friendly labels
      const accessibilityMap = {
        'wheelchair-access': 'Wheelchair accessible',
        'accessible-toilets': 'Accessible toilets',
        'pool-lift': 'Pool lift',
        'family-change-rooms': 'Family change rooms',
        'quiet-area': 'Quiet area',
        'pet-friendly': 'Pet friendly',
        'pram-access': 'Pram accessible',
        'baby-change': 'Baby change facilities',
        'seating-available': 'Seating available'
      };
      
      return [...accessibilityFeatures].map(feature => ({
        value: feature,
        label: accessibilityMap[feature] || feature
      })).sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      console.error('Error getting accessibility options:', error);
      return [];
    }
  }

  // Search programs with filters
  async searchPrograms(filters = {}) {
    try {
      const programs = await this.getPrograms();
      let results = [...programs];

      // Text search
      if (filters.query && filters.query.trim()) {
        const query = filters.query.toLowerCase().trim();
        const queryWords = query.split(/\s+/).filter(word => word.length > 0);
        
        results = results.filter(program => {
          // Create searchable text from all relevant fields
          const searchFields = [
            program.title,
            program.sport,
            program.description,
            program.venue?.name,
            program.venue?.suburb,
            program.venue?.address,
            ...(program.inclusivityTags || []),
            ...(program.accessibility || []),
            ...(program.ageGroups || []),
            program.cost === 0 ? 'free' : '',
            program.costUnit || ''
          ].filter(Boolean);
          
          const searchText = searchFields.join(' ').toLowerCase();
          
          // Check if ALL query words match (can be partial matches)
          return queryWords.every(word => {
            if (searchText.includes(word)) return true;
            
            // Check individual fields for better word boundary matching
            return searchFields.some(field => {
              const fieldText = String(field).toLowerCase();
              
              // Exact word boundary match
              const wordBoundaryRegex = new RegExp(`\\b${this.escapeRegExp(word)}`, 'i');
              if (wordBoundaryRegex.test(fieldText)) return true;
              
              // Partial word match (at least 3 characters)
              if (word.length >= 3) {
                return fieldText.split(/\s+/).some(fieldWord => 
                  fieldWord.startsWith(word) || fieldWord.includes(word)
                );
              }
              
              return false;
            });
          });
        });
      }

      // Sport filter
      if (filters.sport) {
        results = results.filter(program => program.sport === filters.sport);
      }

      // Age group filter
      if (filters.ageGroup) {
        results = results.filter(program => 
          program.ageGroups && program.ageGroups.includes(filters.ageGroup)
        );
      }

      // Max cost filter
      if (filters.maxCost !== undefined && filters.maxCost !== null && String(filters.maxCost).trim() !== '') {
        const maxCost = parseFloat(String(filters.maxCost).trim());
        if (!isNaN(maxCost) && maxCost >= 0) {
          results = results.filter(program => program.cost <= maxCost);
        }
      }

      // Accessibility filters
      if (filters.accessibility && filters.accessibility.length > 0) {
        results = results.filter(program => {
          const programAccessibility = program.accessibility || [];
          return filters.accessibility.some(filter => 
            programAccessibility.includes(filter)
          );
        });
      }

      // Sort by relevance (free programs first, then by cost)
      return results.sort((a, b) => {
        if (a.cost === 0 && b.cost > 0) return -1;
        if (a.cost > 0 && b.cost === 0) return 1;
        return a.cost - b.cost;
      });
    } catch (error) {
      console.error('Error searching programs:', error);
      throw new Error('Failed to search programs. Please try again later.');
    }
  }

  // Helper function to escape special regex characters
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Clear cache (useful for testing or when data is updated)
  clearCache() {
    this.programsCache = null;
    this.faqsCache = null;
    this.programsCacheTime = null;
    this.faqsCacheTime = null;
    console.log('Data cache cleared');
  }

  // Create a new program using Cloud Function
  async createProgram(programData) {
    try {
      console.log('Creating program via Cloud Function...', programData);
      
      // Get the Cloud Function reference
      const createProgramFunction = httpsCallable(functions, 'createProgram');
      
      // Call the Cloud Function
      const result = await createProgramFunction(programData);
      
      console.log('Program created successfully:', result.data);
      
      // Clear cache to ensure fresh data on next fetch
      this.clearCache();
      
      return result.data;
    } catch (error) {
      console.error('Error creating program:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Failed to create program. Please try again.';
      if (error.code === 'functions/invalid-argument') {
        errorMessage = error.message || 'Invalid program data provided.';
      } else if (error.code === 'functions/permission-denied') {
        errorMessage = 'You do not have permission to create programs.';
      } else if (error.code === 'functions/unauthenticated') {
        errorMessage = 'Please log in to create a program.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Get featured programs (for home page)
  async getFeaturedPrograms(limit = 6) {
    try {
      const programs = await this.getPrograms();
      
      // Score & pick up to specified limit for "Featured"
      const withScore = programs.map(p => {
        let score = 0;
        if (p.inclusivityTags?.includes('beginner-friendly')) score += 2;
        if (p.cost === 0) score += 2;
        if (p.cost > 0 && p.cost <= 5) score += 1;
        return { ...p, _score: score };
      });
      
      withScore.sort((a, b) => b._score - a._score || a.cost - b.cost);
      return withScore.slice(0, limit);
    } catch (error) {
      console.error('Error getting featured programs:', error);
      return [];
    }
  }
}

// Create singleton instance
export const dataService = new DataService();
export default dataService;
