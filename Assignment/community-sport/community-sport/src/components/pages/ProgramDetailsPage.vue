<template>
  <div class="container py-4 py-lg-5">
    <div v-if="!program" class="text-center py-5">
      <i class="bi bi-exclamation-circle display-1 text-muted"></i>
      <h3 class="mt-3 text-muted">Program not found</h3>
      <p class="text-muted">The program you're looking for doesn't exist or has been removed.</p>
      <RouterLink :to="{ name: 'find' }" class="btn btn-primary">
        <i class="bi bi-search me-2"></i>Browse Programs
      </RouterLink>
    </div>

    <div v-else>
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <RouterLink :to="{ name: 'home' }">Home</RouterLink>
          </li>
          <li class="breadcrumb-item">
            <RouterLink :to="{ name: 'find' }">Find Sports</RouterLink>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ program.title }}</li>
        </ol>
      </nav>

      <div class="row">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Program Header -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h1 class="h3 mb-2">{{ program.title }}</h1>
                  <div class="d-flex align-items-center gap-3 text-muted">
                    <span><i class="bi bi-trophy me-1"></i>{{ program.sport }}</span>
                    <span><i class="bi bi-geo-alt me-1"></i>{{ program.venue?.suburb || 'Melbourne' }}</span>
                    <span><i class="bi bi-people me-1"></i>Max {{ program.maxParticipants }} participants</span>
                  </div>
                </div>
                <div class="text-end">
                  <div class="h4 mb-0 text-primary">
                    {{ formatCost(program.cost, program.costUnit) }}
                  </div>
                </div>
              </div>

              <!-- Rating Display -->
              <div class="mb-3">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <div class="stars">
                    <i 
                      v-for="star in 5" 
                      :key="star"
                      :class="star <= Math.floor(averageRating) ? 'bi bi-star-fill text-warning' : 
                              star === Math.ceil(averageRating) && averageRating % 1 >= 0.5 ? 'bi bi-star-half text-warning' : 
                              'bi bi-star text-muted'"
                    ></i>
                  </div>
                  <span class="fw-semibold">{{ averageRating.toFixed(1) }}</span>
                  <span class="text-muted">({{ totalRatings }} {{ totalRatings === 1 ? 'review' : 'reviews' }})</span>
                </div>

                <!-- Rating Frequency Bars -->
                <div class="rating-bars" v-if="totalRatings > 0">
                  <div v-for="rating in [5,4,3,2,1]" :key="rating" class="d-flex align-items-center gap-2 mb-1">
                    <span class="rating-label">{{ rating }} star</span>
                    <div class="progress flex-grow-1" style="height: 8px;">
                      <div 
                        class="progress-bar bg-warning" 
                        :style="{ width: (ratingFrequency[rating] / totalRatings * 100) + '%' }"
                      ></div>
                    </div>
                    <span class="rating-count text-muted">{{ ratingFrequency[rating] }}</span>
                  </div>
                </div>
              </div>

              <p class="mb-3">{{ program.description }}</p>

              <!-- Age Groups -->
              <div class="mb-3" v-if="program.ageGroups?.length">
                <h6 class="fw-semibold mb-2">Age Groups</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="age in program.ageGroups" 
                    :key="age" 
                    class="badge bg-light text-dark border"
                  >
                    {{ age }} years
                  </span>
                </div>
              </div>

              <!-- Inclusivity Tags -->
              <div class="mb-3" v-if="program.inclusivityTags?.length">
                <h6 class="fw-semibold mb-2">Features</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="tag in program.inclusivityTags" 
                    :key="tag" 
                    class="badge bg-primary"
                  >
                    {{ formatTag(tag) }}
                  </span>
                </div>
              </div>

              <!-- Accessibility -->
              <div class="mb-4" v-if="program.accessibility?.length">
                <h6 class="fw-semibold mb-2">Accessibility</h6>
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="access in program.accessibility" 
                    :key="access" 
                    class="badge bg-success"
                  >
                    <i class="bi bi-check-circle me-1"></i>{{ formatTag(access) }}
                  </span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-2">
                <button 
                  @click="handleBooking" 
                  class="btn btn-primary btn-lg"
                  :disabled="isSubmitting"
                >
                  <i class="bi bi-calendar-plus me-2"></i>
                  {{ isSubmitting ? 'Processing...' : 'Book Program' }}
                </button>
                <button 
                  @click="openCommentModal" 
                  class="btn btn-outline-secondary"
                >
                  <i class="bi bi-chat-dots me-2"></i>Add Review
                </button>
              </div>
            </div>
          </div>

          <!-- Comments Section -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">
                <i class="bi bi-chat-left-text me-2"></i>Reviews & Comments
              </h5>
            </div>
            <div class="card-body">
              <div v-if="loadingComments" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading comments...</span>
                </div>
              </div>
              
              <div v-else-if="comments.length === 0" class="text-center py-4 text-muted">
                <i class="bi bi-chat-square-dots display-4 mb-3"></i>
                <p>No reviews yet. Be the first to share your experience!</p>
                <button @click="openCommentModal" class="btn btn-primary">
                  <i class="bi bi-plus-circle me-2"></i>Add First Review
                </button>
              </div>

    <div v-else>
                <div v-for="comment in comments" :key="comment.id" class="comment-item border-bottom pb-3 mb-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-circle">
                        {{ getInitials(comment.userName) }}
                      </div>
                      <div>
                        <h6 class="mb-0">{{ comment.userName }}</h6>
                        <div class="stars small">
                          <i 
                            v-for="star in 5" 
                            :key="star"
                            :class="star <= comment.rating ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                          ></i>
                        </div>
                      </div>
                    </div>
                    <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
                  </div>
                  <p class="mb-0">{{ comment.comment }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Schedule Card -->
          <div class="card mb-4" v-if="program.schedule?.length">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="bi bi-calendar-week me-2"></i>Schedule
              </h6>
            </div>
            <div class="card-body">
              <div v-for="schedule in program.schedule" :key="schedule.day" class="mb-3">
                <div class="fw-semibold">{{ schedule.day }}</div>
                <div class="text-muted">{{ schedule.start }} - {{ schedule.end }}</div>
                <div class="small text-muted">{{ schedule.frequency }}</div>
                <div class="small text-muted" v-if="schedule.startDate">
                  Starts: {{ formatDate(schedule.startDate) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Venue Card -->
          <div class="card mb-4" v-if="program.venue">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="bi bi-geo-alt me-2"></i>Venue
              </h6>
            </div>
            <div class="card-body">
              <h6>{{ program.venue.name }}</h6>
              <p class="mb-2">
                {{ program.venue.address }}<br>
                {{ program.venue.suburb }}, {{ program.venue.postcode }}
              </p>
            </div>
          </div>

          <!-- Equipment Card -->
          <div class="card mb-4" v-if="program.equipment">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="bi bi-gear me-2"></i>Equipment
              </h6>
            </div>
            <div class="card-body">
              <div class="mb-2">
                <strong>Provided:</strong> 
                <span :class="program.equipment.provided ? 'text-success' : 'text-danger'">
                  {{ program.equipment.provided ? 'Yes' : 'No' }}
                </span>
              </div>
              <div v-if="program.equipment.required?.length">
                <strong>You need to bring:</strong>
                <ul class="mb-0 mt-1">
                  <li v-for="item in program.equipment.required" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Contact Card -->
          <div class="card" v-if="program.contact">
            <div class="card-header">
              <h6 class="card-title mb-0">
                <i class="bi bi-person-lines-fill me-2"></i>Contact
              </h6>
            </div>
            <div class="card-body">
              <p class="mb-2">
                <i class="bi bi-envelope me-2"></i>
                <a :href="'mailto:' + program.contact.email">{{ program.contact.email }}</a>
              </p>
              <p class="mb-0" v-if="program.contact.phone">
                <i class="bi bi-telephone me-2"></i>
                <a :href="'tel:' + program.contact.phone">{{ program.contact.phone }}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment Modal -->
    <div class="modal fade" id="commentModal" tabindex="-1" aria-labelledby="commentModalLabel" aria-hidden="true" @click.self="closeCommentModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="commentModalLabel">Add Review</h5>
            <button type="button" class="btn-close" @click="closeCommentModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitComment">
              <!-- Rating Selection -->
              <div class="mb-3">
                <label class="form-label fw-semibold">Your Rating *</label>
                <div class="rating-input d-flex gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="commentForm.rating = star"
                    class="btn btn-link p-0 border-0 star-button"
                    :class="star <= commentForm.rating ? 'text-warning' : 'text-muted'"
                    :title="`Rate ${star} star${star !== 1 ? 's' : ''}`"
                  >
                    <!-- Bootstrap Icons only -->
                    <i 
                      :class="star <= commentForm.rating ? 'bi bi-star-fill' : 'bi bi-star'" 
                      style="font-size: 1.5rem;"
                    ></i>
                  </button>
                </div>
                <div class="form-text">Click stars to rate (1-5 stars)</div>
              </div>

              <!-- Comment Text -->
              <div class="mb-3">
                <label for="commentText" class="form-label fw-semibold">Your Review *</label>
                <textarea
                  id="commentText"
                  v-model="commentForm.comment"
                  class="form-control"
                  rows="4"
                  placeholder="Share your experience with this program..."
                  required
                ></textarea>
                <div class="form-text">{{ commentForm.comment.length }}/500 characters</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCommentModal">Cancel</button>
            <button 
              type="button" 
              @click="submitComment" 
              class="btn btn-primary"
              :disabled="!isCommentFormValid || commentSubmitting"
            >
              <span v-if="commentSubmitting" class="spinner-border spinner-border-sm me-2" role="status"></span>
              {{ commentSubmitting ? 'Submitting...' : 'Submit Review' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase.js';
import authService from '../../services/AuthService.js';
import programs from '../../assets/data/programs.json';

const route = useRoute();
const router = useRouter();

// Data
const program = ref(null);
const comments = ref([]);
const loadingComments = ref(true);
const isSubmitting = ref(false);
const commentSubmitting = ref(false);

// Comment Form
const commentForm = ref({
  rating: 0,
  comment: ''
});

// Computed
const averageRating = computed(() => {
  if (comments.value.length === 0) return 0;
  const sum = comments.value.reduce((acc, comment) => acc + comment.rating, 0);
  return sum / comments.value.length;
});

const totalRatings = computed(() => comments.value.length);

const ratingFrequency = computed(() => {
  const freq = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  comments.value.forEach(comment => {
    freq[comment.rating]++;
  });
  return freq;
});

const isCommentFormValid = computed(() => {
  return commentForm.value.rating > 0 && 
         commentForm.value.comment.trim().length > 0 && 
         commentForm.value.comment.length <= 500;
});

// Methods
function formatCost(cost, costUnit) {
  if (cost === 0) return 'Free';
  return `$${cost} ${costUnit || 'per session'}`;
}

function formatTag(tag) {
  return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

async function loadComments() {
  if (!program.value) return;
  
  loadingComments.value = true;
  try {
    // Temporarily remove orderBy to avoid index requirement
    // Will sort in JavaScript instead
    const q = query(
      collection(db, 'program-comments'),
      where('programID', '==', program.value.id)
    );
    
    const querySnapshot = await getDocs(q);
    comments.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error loading comments:', error);
    comments.value = [];
  } finally {
    loadingComments.value = false;
  }
}

async function openCommentModal() {
  console.log('openCommentModal called');
  const currentUser = authService.getCurrentUserSync();
  console.log('Current user:', currentUser);
  
  if (!currentUser.user) {
    console.log('No user found, redirecting to login');
    router.push({ name: 'login' });
    return;
  }
  
  // Reset form
  commentForm.value = { rating: 0, comment: '' };
  console.log('Form reset, opening modal...');
  
  // Show modal with error handling
  try {
    const modalElement = document.getElementById('commentModal');
    if (!modalElement) {
      console.error('Modal element not found');
      return;
    }
    
    console.log('Modal element found:', modalElement);
    console.log('Bootstrap available:', typeof window.bootstrap !== 'undefined');
    
    // Try Bootstrap first, then fallback to CSS
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Modal) {
      try {
        const modal = new window.bootstrap.Modal(modalElement);
        modal.show();
        console.log('Modal opened with Bootstrap');
        return;
      } catch (bootstrapError) {
        console.warn('Bootstrap modal failed, using fallback:', bootstrapError);
      }
    }
    
    // Fallback: show modal with basic CSS
    console.log('Using CSS fallback to show modal');
    modalElement.classList.add('show');
    modalElement.style.display = 'flex';
    document.body.classList.add('modal-open');
    
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}

function closeCommentModal() {
  try {
    const modalElement = document.getElementById('commentModal');
    if (window.bootstrap && typeof window.bootstrap.Modal !== 'undefined') {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    } else {
      // Fallback: hide modal with basic CSS
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        // Remove backdrop if it exists
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  } catch (error) {
    console.error('Error closing modal:', error);
    // Force close with CSS
    const modalElement = document.getElementById('commentModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}

async function submitComment() {
  const currentUser = await authService.getCurrentUser();
  if (!currentUser.user) {
    router.push({ name: 'login' });
    return;
  }

  if (!isCommentFormValid.value) return;

  commentSubmitting.value = true;
  try {
    const commentData = {
      userName: currentUser.userName || currentUser.user.email.split('@')[0],
      programID: program.value.id,
      comment: commentForm.value.comment.trim(),
      rating: commentForm.value.rating,
      createdAt: new Date().toISOString(),
      userID: currentUser.user.uid
    };

    await addDoc(collection(db, 'program-comments'), commentData);
    
    // Close modal
    try {
      const modalElement = document.getElementById('commentModal');
      if (window.bootstrap && typeof window.bootstrap.Modal !== 'undefined') {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        } else {
          // Create new instance if none exists
          const newModal = new window.bootstrap.Modal(modalElement);
          newModal.hide();
        }
      } else {
        // Fallback: hide modal with basic CSS
        if (modalElement) {
          modalElement.classList.remove('show');
          modalElement.style.display = 'none';
          document.body.classList.remove('modal-open');
          // Remove backdrop if it exists
          const backdrop = document.querySelector('.modal-backdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      }
    } catch (error) {
      console.error('Error closing modal:', error);
      // Force close with CSS
      const modalElement = document.getElementById('commentModal');
      if (modalElement) {
        modalElement.classList.remove('show');
        modalElement.style.display = 'none';
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
    
    // Reload comments
    await loadComments();
    
    // Reset form
    commentForm.value = { rating: 0, comment: '' };
    
  } catch (error) {
    console.error('Error submitting comment:', error);
    alert('Error submitting review. Please try again.');
  } finally {
    commentSubmitting.value = false;
  }
}

async function handleBooking() {
  const currentUser = authService.getCurrentUserSync();
  if (!currentUser.user) {
    router.push({ name: 'login' });
    return;
  }

  if (currentUser.role === 'member') {
    router.push({ name: 'member-appointment' });
  } else {
    alert('Only members can book programs. Please switch to member role or register as a member.');
  }
}

// Lifecycle
onMounted(async () => {
  program.value = programs.find(p => String(p.id) === String(route.params.id)) || null;
  if (program.value) {
    await loadComments();
  }
});
</script>

<style scoped>
.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--bs-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.stars i {
  font-size: 1rem;
  font-style: normal;
  font-weight: normal;
  display: inline-block;
  line-height: 1;
}

/* Star icons styling */
/* Fallback for when Bootstrap Icons don't load - use CSS content */
.bi-star:before {
  content: "☆";
}

.bi-star-fill:before {
  content: "★";
}

.bi-star-half:before {
  content: "⭐";
}

/* Ensure Bootstrap Icons override the fallback when loaded */
.bi-star[class*="bi-"]:before,
.bi-star-fill[class*="bi-"]:before,
.bi-star-half[class*="bi-"]:before {
  font-family: "bootstrap-icons" !important;
}

.rating-bars {
  max-width: 300px;
}

.rating-label {
  width: 50px;
  font-size: 0.875rem;
}

.rating-count {
  width: 30px;
  text-align: right;
  font-size: 0.875rem;
}

.comment-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}

.rating-input button:hover {
  transform: scale(1.1);
  transition: transform 0.1s ease;
}

.star-button {
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-button:hover {
  transform: scale(1.2) !important;
}

.star-button:focus {
  outline: 2px solid #ffc107;
  outline-offset: 2px;
}

/* Star button styling */
.star-button i {
  display: inline-block;
  line-height: 1;
}

/* Ensure modal works even without Bootstrap JS */
.modal.show {
  display: block !important;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
  opacity: 0.5;
}

body.modal-open {
  overflow: hidden;
}

/* Debug styles to help identify modal issues */
#commentModal {
  z-index: 1050;
}

#commentModal .modal-dialog {
  margin: 1.75rem auto;
  max-width: 500px;
}

/* Click outside to close functionality */
.modal.show {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-primary {
  border-radius: 8px;
}

.btn-outline-secondary {
  border-radius: 8px;
}

.badge {
  border-radius: 6px;
}
</style>