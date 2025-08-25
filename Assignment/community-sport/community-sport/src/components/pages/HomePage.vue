<script setup>
import { computed } from 'vue';
import SearchBar from '../SearchBar.vue';
import ProgramCard from '../ProgramCard.vue';

// Use relative import from /src/components/pages/ → /src/assets/data/
import programs from '../../assets/data/programs.json';

// Hero copy (static)
const hero = {
  title: 'Move more, feel better.',
  subtitle:
    'Discover inclusive, low-cost community sport programs across Melbourne. Start with a quick search below.'
};

// Score & pick up to 6 items for "Featured"
const featured = computed(() => {
  const list = Array.isArray(programs) ? programs : [];
  const withScore = list.map(p => {
    let score = 0;
    if (p.inclusivityTags?.includes('beginner-friendly')) score += 2;
    if (p.cost === 0) score += 2;
    if (p.cost > 0 && p.cost <= 5) score += 1;
    return { ...p, _score: score };
  });
  withScore.sort((a, b) => b._score - a._score || a.cost - b.cost);
  return withScore.slice(0, 6);
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <!-- Hero -->
    <section class="text-center mb-4 mb-lg-5">
      <h1 class="display-5 fw-semibold">{{ hero.title }}</h1>
      <p class="lead text-muted mx-auto" style="max-width: 52ch">
        {{ hero.subtitle }}
      </p>
      <div class="mt-3 mt-lg-4 d-flex justify-content-center">
        <SearchBar placeholder="Try ‘netball’, ‘walking football’, ‘wheelchair access’…" />
      </div>
    </section>

    <!-- Featured Programs -->
    <section aria-labelledby="featured-heading">
      <div class="d-flex align-items-baseline justify-content-between mb-2">
        <h2 id="featured-heading" class="h4 m-0">Featured programs</h2>
        <RouterLink :to="{ name: 'find' }" class="link-primary">See all</RouterLink>
      </div>

      <!-- Responsive grid: 1 / 2 / 3 columns -->
      <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
        <div v-for="p in featured" :key="p.id" class="col">
          <ProgramCard :program="p" />
        </div>
      </div>

      <div v-if="featured.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-emoji-neutral" aria-hidden="true"></i>
        <p class="mt-2 mb-0">No featured programs yet. Please check back soon.</p>
      </div>
    </section>
  </div>
</template>
