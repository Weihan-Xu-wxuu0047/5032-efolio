<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Organizer Dashboard</h1>
            <p class="text-muted mb-0">Manage and create sports programs for your community</p>
          </div>
          <div class="d-flex gap-2">
            <RoleSwitcher />
            <button @click="handleLogout" class="btn btn-outline-secondary">
              <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
              Logout
            </button>
          </div>
        </div>

        <!-- My Account Component -->
        <MyAccount />

        <!-- Launch Programs Section -->
        <div class="card mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
              Program Management
            </h5>
          </div>
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-md-8">
                <h6 class="mb-2">Ready to create a new program?</h6>
                <p class="text-muted mb-md-0">
                  Launch new sports programs and events to engage your community. 
                  Set schedules, manage registrations, and track participation.
                </p>
              </div>
              <div class="col-md-4 text-md-end">
                <RouterLink :to="{ name: 'launch-program' }" class="btn btn-success btn-lg">
                  <i class="bi bi-rocket-takeoff me-2" aria-hidden="true"></i>
                  Launch Programs
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- My Programs Overview -->
        <div class="card mb-4">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0">
              <i class="bi bi-list-check me-2" aria-hidden="true"></i>
              My Programs
            </h5>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="bi bi-clipboard-data display-4 text-muted mb-3" aria-hidden="true"></i>
              <h6 class="text-muted mb-3">No Programs Created Yet</h6>
              <p class="text-muted mb-4">
                You haven't created any programs yet. Start by launching your first program!
              </p>
              <RouterLink :to="{ name: 'launch-program' }" class="btn btn-outline-success">
                <i class="bi bi-plus-circle me-2" aria-hidden="true"></i>
                Create Your First Program
              </RouterLink>
            </div>
            
            <!-- Future: Program management cards will be displayed here -->
            <div class="d-none" id="organizer-programs-list">
              <!-- This section is reserved for displaying organizer's programs -->
              <!-- Will show program management cards with details like:
                   - Program name and sport
                   - Participant count and capacity
                   - Schedule and venue
                   - Status (active, draft, completed)
                   - Actions (edit, view participants, analytics, etc.)
              -->
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-4">
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-people text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Participants</h6>
                <p class="card-text text-muted small">Manage registrations and participant communications</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-bar-chart text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Analytics</h6>
                <p class="card-text text-muted small">View program performance and engagement metrics</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-calendar-week text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Schedule</h6>
                <p class="card-text text-muted small">Manage program schedules and venue bookings</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div v-if="!hasMemberRole" class="col-md-3">
            <div class="card h-100 border-0 bg-primary text-white">
              <div class="card-body text-center">
                <i class="bi bi-person text-white mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Join Programs</h6>
                <p class="card-text small">Participate in community sports programs</p>
                <RouterLink :to="{ name: 'register' }" class="btn btn-light btn-sm">
                  Add Member Role
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/AuthService.js';
import MyAccount from '../MyAccount.vue';
import RoleSwitcher from '../RoleSwitcher.vue';

const router = useRouter();

// Check if user has member role
const currentUser = ref({ user: null, role: null, availableRoles: [] });
const hasMemberRole = computed(() => {
  const availableRoles = currentUser.value.availableRoles || [];
  return availableRoles.includes('member');
});

// Load user data on mount
onMounted(async () => {
  const userData = await authService.getCurrentUser();
  currentUser.value = userData;
});

// Listen for auth state changes
const unsubscribe = authService.onAuthStateChange(async (user, role) => {
  if (user) {
    const userData = await authService.getCurrentUser();
    currentUser.value = userData;
  } else {
    currentUser.value = { user: null, role: null, availableRoles: [] };
  }
});

// Cleanup on unmount
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

// Handle logout
async function handleLogout() {
  try {
    await authService.logout();
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Logout error:', error);
  }
}
</script>

<style scoped>
.bg-light {
  background-color: #f8f9fa !important;
}

.card {
  border-radius: 12px;
}

.display-1 {
  font-size: 4rem;
}
</style>
