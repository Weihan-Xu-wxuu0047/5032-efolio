<template>
  <!-- Skip link for keyboard users -->
  <a href="#main-content" class="visually-hidden-focusable position-absolute top-0 start-0 m-2 btn btn-outline-primary btn-sm">
    Skip to content
  </a>


  <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom">
    <div class="container">
      <RouterLink class="navbar-brand d-flex align-items-center gap-2" :to="{ name: 'home' }">
        <span class="rounded-circle bg-primary d-inline-block" style="width: 10px; height: 10px;"></span>
        <span class="fw-semibold">Community Sport</span>
      </RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNav"
        aria-controls="mainNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="mainNav">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink
              :to="{ name: 'home' }"
              class="nav-link"
              :class="linkActiveClass('home')"
            >
              Home
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              :to="{ name: 'find' }"
              class="nav-link"
              :class="linkActiveClass('find')"
            >
              Find Sports
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              :to="{ name: 'support' }"
              class="nav-link"
              :class="linkActiveClass('support')"
            >
              Support
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <!-- Main outlet -->
  <main id="main-content">
    <!-- Let pages decide their own container spacing; Home uses .container -->
    <RouterView />
  </main>

  <!-- Footer -->
  <footer class="mt-auto border-top">
    <div class="container py-4">
      <div class="row gy-2 align-items-center">
        <div class="col-12 col-md">
          <small class="text-muted">
            © {{ new Date().getFullYear() }} Community Sport NFP — Melbourne
          </small>
        </div>
        <div class="col-12 col-md-auto">
          <nav aria-label="Footer">
            <ul class="list-inline m-0">
              <li class="list-inline-item"><RouterLink class="link-secondary" :to="{ name: 'find' }">Browse Programs</RouterLink></li>
              <li class="list-inline-item"><RouterLink class="link-secondary" :to="{ name: 'support' }">Contact</RouterLink></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRoute } from 'vue-router';

const route = useRoute();

/**
 * Returns 'active' for the current named route so Bootstrap can style it.
 * This keeps things simple while your route list is small.
 */
function linkActiveClass(name) {
  return route.name === name ? 'active' : '';
}
</script>

<style>
/* Make the skip link visible on focus (Bootstrap’s visually-hidden-focusable helper) */
.visually-hidden-focusable:not(:focus):not(:focus-within) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
html, body, #app {
  height: 100%;
}
#app {
  display: flex;
  flex-direction: column;
}
main {
  flex: 1 0 auto;
}
footer {
  flex-shrink: 0;
}
</style>
