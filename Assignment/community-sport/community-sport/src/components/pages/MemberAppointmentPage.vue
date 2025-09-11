<template>
  <div class="container py-4 py-lg-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <!-- Header -->
        <div class="text-center mb-5">
          <h1 class="h3 mb-3">Book Your Appointment</h1>
          <p class="text-muted">This page is under development. Appointment booking functionality will be available soon.</p>
        </div>

        <!-- Coming Soon Card -->
        <div class="card border-0 bg-light">
          <div class="card-body text-center py-5">
            <i class="bi bi-calendar-plus display-1 text-primary mb-4"></i>
            <h4 class="mb-3">Appointment Booking</h4>
            <p class="text-muted mb-4">
              We're working on building a comprehensive appointment booking system that will allow you to:
            </p>
            
            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <div class="d-flex align-items-start">
                  <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <div class="text-start">
                    <h6 class="mb-1">Select Time Slots</h6>
                    <small class="text-muted">Choose from available program sessions</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-start">
                  <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <div class="text-start">
                    <h6 class="mb-1">Manage Bookings</h6>
                    <small class="text-muted">View, modify, or cancel your appointments</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-start">
                  <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <div class="text-start">
                    <h6 class="mb-1">Calendar Integration</h6>
                    <small class="text-muted">Sync with your personal calendar</small>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex align-items-start">
                  <i class="bi bi-check-circle-fill text-success me-3 mt-1"></i>
                  <div class="text-start">
                    <h6 class="mb-1">Notifications</h6>
                    <small class="text-muted">Get reminders about upcoming sessions</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-center">
              <RouterLink :to="{ name: 'find' }" class="btn btn-primary">
                <i class="bi bi-search me-2"></i>Browse Programs
              </RouterLink>
              <RouterLink :to="{ name: 'member-account' }" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>Back to Account
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Development Note -->
        <div class="alert alert-info mt-4" role="alert">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Development Note:</strong> This page is intentionally left blank as requested. 
          The appointment booking functionality will be implemented in future updates.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// This page is intentionally minimal as requested
// Future implementation will include:
// - Calendar component for date/time selection
// - Program session availability checking
// - Booking form with participant details
// - Payment integration (if required)
// - Booking confirmation and management
</script>

<style scoped>
.card {
  border-radius: 12px;
}

.btn {
  border-radius: 8px;
}

.display-1 {
  font-size: 4rem;
}
</style>
