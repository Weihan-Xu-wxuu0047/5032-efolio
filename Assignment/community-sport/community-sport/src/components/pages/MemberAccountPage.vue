<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Member Dashboard</h1>
            <p class="text-muted mb-0">Manage your sports activities and programs</p>
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

        <!-- My Programs Section -->
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="card-title mb-0">
              <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>
              My Programs
            </h5>
          </div>
          <div class="card-body">
            <div class="text-center py-5">
              <i class="bi bi-calendar-plus display-4 text-muted mb-3" aria-hidden="true"></i>
              <h6 class="text-muted mb-3">No Programs Yet</h6>
              <p class="text-muted mb-4">
                You haven't joined any programs yet. Start exploring and join programs that interest you!
              </p>
              <RouterLink :to="{ name: 'find' }" class="btn btn-primary">
                <i class="bi bi-search me-2" aria-hidden="true"></i>
                Find Sports Programs
              </RouterLink>
            </div>
            
            <!-- Future: Program cards will be displayed here -->
            <div class="d-none" id="programs-list">
              <!-- This section is reserved for displaying user's programs -->
              <!-- Will show program cards with details like:
                   - Program name and sport
                   - Schedule and venue
                   - Registration status
                   - Actions (view details, cancel registration, etc.)
              -->
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row g-4 mt-4">
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-heart text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Favorites</h6>
                <p class="card-text text-muted small">Your saved programs and activities</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-star text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Reviews</h6>
                <p class="card-text text-muted small">Rate and review programs you've joined</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-bell text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Notifications</h6>
                <p class="card-text text-muted small">Program updates and reminders</p>
                <button class="btn btn-outline-primary btn-sm" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
          <div v-if="!hasOrganizerRole" class="col-md-3">
            <div class="card h-100 border-0 bg-success text-white">
              <div class="card-body text-center">
                <i class="bi bi-people text-white mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Become Organizer</h6>
                <p class="card-text small">Create and manage sports programs</p>
                <RouterLink :to="{ name: 'register' }" class="btn btn-light btn-sm">
                  Add Organizer Role
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

// Check if user has organizer role
const currentUser = ref({ user: null, role: null, availableRoles: [] });
const hasOrganizerRole = computed(() => {
  const availableRoles = currentUser.value.availableRoles || [];
  return availableRoles.includes('organizer');
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
