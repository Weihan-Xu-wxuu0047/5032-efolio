<template>
  <div class="container py-4 py-lg-5">
    <div class="row">
      <div class="col-12">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 class="h3 mb-1">Organizer Dashboard</h1>
            <p class="text-muted mb-0">Welcome back, {{ userEmail }}</p>
          </div>
          <button @click="handleLogout" class="btn btn-outline-secondary">
            <i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>
            Logout
          </button>
        </div>

        <!-- Placeholder Content -->
        <div class="row g-4">
          <div class="col-12">
            <div class="card">
              <div class="card-body text-center py-5">
                <i class="bi bi-people-fill display-1 text-muted mb-3" aria-hidden="true"></i>
                <h4 class="card-title">Organizer Account Page</h4>
                <p class="card-text text-muted">
                  This page is reserved for future development.<br>
                  Organizer-specific features will be implemented here.
                </p>
                <div class="mt-4">
                  <RouterLink :to="{ name: 'home' }" class="btn btn-primary me-2">
                    <i class="bi bi-house me-2" aria-hidden="true"></i>
                    Go to Home
                  </RouterLink>
                  <RouterLink :to="{ name: 'find' }" class="btn btn-outline-primary">
                    <i class="bi bi-search me-2" aria-hidden="true"></i>
                    Browse Programs
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Future Features Preview -->
        <div class="row g-4 mt-2">
          <div class="col-md-4">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-plus-circle text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Create Programs</h6>
                <p class="card-text text-muted small">Add new sport programs and events</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-list-check text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Manage Programs</h6>
                <p class="card-text text-muted small">Edit and update your existing programs</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card h-100 border-0 bg-light">
              <div class="card-body text-center">
                <i class="bi bi-graph-up text-primary mb-3" style="font-size: 2rem;" aria-hidden="true"></i>
                <h6 class="card-title">Analytics</h6>
                <p class="card-text text-muted small">View program statistics and reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../../services/AuthService.js';

const router = useRouter();

// Get current user info
const currentUser = computed(() => authService.getCurrentUser());
const userEmail = computed(() => currentUser.value.user?.email || 'Organizer');

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
