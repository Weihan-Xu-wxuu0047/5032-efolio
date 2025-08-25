<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import programs from '../../assets/data/programs.json';// will work after step 2; if not using alias, change to relative

const route = useRoute();
const program = ref(null);

onMounted(() => {
  program.value = programs.find(p => String(p.id) === String(route.params.id)) || null;
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <h1 class="h3 mb-3">Program Details</h1>
    <div v-if="!program" class="text-muted">Program not found.</div>
    <div v-else>
      <h2 class="h4">{{ program.title }}</h2>
      <p class="text-muted">{{ program.sport }} · {{ program.venue?.suburb || 'Melbourne' }}</p>
      <p>{{ program.description }}</p>
    </div>
  </div>
</template>
