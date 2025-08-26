<script setup>
import FaqAccordion from '../FaqAccordion.vue';
import ContactForm from '../ContactForm.vue';

// Load local dynamic data
import faqs from '../../assets/data/faqs.json';
</script>

<template>
  <div class="container py-4 py-lg-5">
    <header class="mb-4">
      <h1 class="h3 mb-1">Support</h1>
      <p class="text-muted">Find answers quickly or send us a message.</p>
    </header>

    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" class="h5 mb-3">Frequently Asked Questions</h2>
          <FaqAccordion :items="faqs" />
        </section>
      </div>

      <div class="col-12 col-lg-6">
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" class="h5 mb-3">Contact us</h2>
          <ContactForm />
        </section>
      </div>
    </div>
  </div>
</template>
