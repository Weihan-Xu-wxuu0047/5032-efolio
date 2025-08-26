<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SearchBar from '../SearchBar.vue';
import FiltersPanel from '../FiltersPanel.vue';
import ResultsList from '../ResultsList.vue';
import programs from '../../assets/data/programs.json';

const route = useRoute();
const router = useRouter();

// Component refs
const filtersPanelRef = ref(null);

// State
const loading = ref(false);
const currentFilters = ref({
  query: '',
  sport: '',
  ageGroup: '',
  maxCost: '',
  accessibility: []
});

// Initialize from URL query
onMounted(async () => {
  if (route.query.q) {
    const initialQuery = String(route.query.q);
    currentFilters.value.query = initialQuery;
    
    // Use nextTick to ensure FiltersPanel is mounted
    await nextTick();
    if (filtersPanelRef.value) {
      filtersPanelRef.value.updateQuery(initialQuery);
    }
  }
});

// Helper function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Search and filtering logic
const filteredPrograms = computed(() => {
  // Check if any filters are applied
  const hasQuery = currentFilters.value.query && currentFilters.value.query.trim();
  const hasSport = currentFilters.value.sport;
  const hasAgeGroup = currentFilters.value.ageGroup;
  const hasMaxCost = currentFilters.value.maxCost && String(currentFilters.value.maxCost || '').trim() !== '';
  const hasAccessibility = currentFilters.value.accessibility.length > 0;
  
  if (!hasQuery && !hasSport && !hasAgeGroup && !hasMaxCost && !hasAccessibility) {
    return [];
  }

  let results = [...programs];

  // Text search
  if (currentFilters.value.query.trim()) {
    const query = currentFilters.value.query.toLowerCase().trim();
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
          const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(word)}`, 'i');
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
  if (currentFilters.value.sport) {
    results = results.filter(program => 
      program.sport === currentFilters.value.sport
    );
  }

  // Age group filter
  if (currentFilters.value.ageGroup) {
    results = results.filter(program => 
      program.ageGroups && program.ageGroups.includes(currentFilters.value.ageGroup)
    );
  }

  // Max cost filter
  if (currentFilters.value.maxCost && String(currentFilters.value.maxCost || '').trim() !== '') {
    const maxCost = parseFloat(String(currentFilters.value.maxCost || '').trim());
    if (!isNaN(maxCost) && maxCost >= 0) {
      results = results.filter(program => 
        program.cost <= maxCost
      );
    }
  }

  // Accessibility filters
  if (currentFilters.value.accessibility.length > 0) {
    results = results.filter(program => {
      const programAccessibility = program.accessibility || [];
      return currentFilters.value.accessibility.some(filter => 
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
});

// Handle filter changes
function onFiltersChanged(filters) {
  loading.value = true;
  
  // Merge new filters with existing ones to avoid overriding URL query
  currentFilters.value = { 
    ...currentFilters.value,
    ...filters 
  };
  
  // Update URL with query parameter
  const query = currentFilters.value.query ? { q: currentFilters.value.query } : {};
  router.replace({ name: 'find', query });

  // Simulate brief loading for better UX
  setTimeout(() => {
    loading.value = false;
  }, 200);
}

// Handle search bar submission
function onSearchSubmit(query) {
  currentFilters.value.query = query;
  if (filtersPanelRef.value) {
    filtersPanelRef.value.updateQuery(query);
  }
}

// Watch route changes (e.g., from SearchBar navigation)
watch(() => route.query.q, (newQuery) => {
  if (newQuery && newQuery !== currentFilters.value.query) {
    currentFilters.value.query = String(newQuery);
    if (filtersPanelRef.value) {
      filtersPanelRef.value.updateQuery(currentFilters.value.query);
    }
  }
});
</script>

<template>
  <div class="container py-4 py-lg-5">
    <!-- Header -->
    <div class="row mb-4">
      <div class="col-12 col-lg-8">
        <h1 class="h3 mb-2">Find Sports Programs</h1>
        <p class="text-muted mb-3">
          Discover inclusive, accessible community sport programs across Melbourne.
        </p>
      </div>
      <div class="col-12 col-lg-4">
        <SearchBar 
          placeholder="Search programs, sports, or features..."
          @submit="onSearchSubmit"
        />
      </div>
    </div>

    <!-- Filters -->
    <FiltersPanel
      ref="filtersPanelRef"
      :initial-query="route.query.q || ''"
      @filters-changed="onFiltersChanged"
    />

    <!-- Results -->
    <ResultsList 
      :programs="filteredPrograms"
      :loading="loading"
    />
  </div>
</template>
