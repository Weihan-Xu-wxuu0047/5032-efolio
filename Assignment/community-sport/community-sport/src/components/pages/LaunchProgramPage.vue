<template>
  <div class="container py-4 py-lg-5">
    <div class="row justify-content-center">
      <div class="col-12 col-xl-10">
        <!-- Header -->
        <div class="d-flex align-items-center mb-4">
          <RouterLink :to="{ name: 'organizer-account' }" class="btn btn-outline-secondary me-3">
            <i class="bi bi-arrow-left me-2" aria-hidden="true"></i>
            Back to Dashboard
          </RouterLink>
          <div>
            <h1 class="h3 mb-1">Launch New Program</h1>
            <p class="text-muted mb-0">Create and configure your community sports program</p>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success" role="alert">
          <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
          {{ successMessage }}
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row g-4">
            <!-- Main Program Information -->
            <div class="col-md-8">
              <div class="card">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-info-circle me-2" aria-hidden="true"></i>
                    Program Information
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Title -->
                  <div class="mb-3">
                    <label for="title" class="form-label">
                      Program Title <span class="text-danger">*</span>
                    </label>
                    <input
                      id="title"
                      ref="titleRef"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': touched.title && errors.title }"
                      v-model.trim="form.title"
                      @blur="onBlur('title')"
                      @input="onInput('title')"
                      placeholder="e.g. Beginner's Tennis Program"
                      required
                    />
                    <div v-if="touched.title && errors.title" class="invalid-feedback">
                      {{ errors.title }}
                    </div>
                  </div>

                  <!-- Sport -->
                  <div class="mb-3">
                    <label for="sport" class="form-label">
                      Sport <span class="text-danger">*</span>
                    </label>
                    <select
                      id="sport"
                      ref="sportRef"
                      class="form-select"
                      :class="{ 'is-invalid': touched.sport && errors.sport }"
                      v-model="form.sport"
                      @blur="onBlur('sport')"
                      @change="onInput('sport')"
                      required
                    >
                      <option value="">Select a sport</option>
                      <option v-for="sport in sportOptions" :key="sport" :value="sport">
                        {{ sport }}
                      </option>
                    </select>
                    <div v-if="touched.sport && errors.sport" class="invalid-feedback">
                      {{ errors.sport }}
                    </div>
                  </div>

                  <!-- Age Groups -->
                  <div class="mb-3">
                    <label class="form-label">
                      Age Groups <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div v-for="ageGroup in ageGroupOptions" :key="ageGroup" class="col-md-4 col-6">
                        <div class="form-check">
                          <input
                            :id="`age-${ageGroup}`"
                            type="checkbox"
                            class="form-check-input"
                            :value="ageGroup"
                            v-model="form.ageGroups"
                            @change="onInput('ageGroups')"
                          />
                          <label :for="`age-${ageGroup}`" class="form-check-label">
                            {{ ageGroup }}
                          </label>
                        </div>
                      </div>
                    </div>
                    <div v-if="touched.ageGroups && errors.ageGroups" class="text-danger small mt-1">
                      {{ errors.ageGroups }}
                    </div>
                  </div>

                  <!-- Description -->
                  <div class="mb-3">
                    <label for="description" class="form-label">
                      Description <span class="text-danger">*</span>
                    </label>
                    <textarea
                      id="description"
                      ref="descriptionRef"
                      rows="4"
                      class="form-control"
                      :class="{ 'is-invalid': touched.description && errors.description }"
                      v-model.trim="form.description"
                      @blur="onBlur('description')"
                      @input="onInput('description')"
                      placeholder="Describe your program, what participants can expect, skill level requirements, equipment needed, etc."
                      required
                    />
                    <div v-if="touched.description && errors.description" class="invalid-feedback">
                      {{ errors.description }}
                    </div>
                    <div class="form-text">{{ form.description.length }}/500 characters</div>
                  </div>

                  <!-- Cost -->
                  <div class="mb-3">
                    <label for="cost" class="form-label">
                      Cost <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">$</span>
                      <input
                        id="cost"
                        ref="costRef"
                        type="number"
                        step="0.01"
                        min="0"
                        class="form-control"
                        :class="{ 'is-invalid': touched.cost && errors.cost }"
                        v-model.number="form.cost"
                        @blur="onBlur('cost')"
                        @input="onInput('cost')"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div v-if="touched.cost && errors.cost" class="invalid-feedback">
                      {{ errors.cost }}
                    </div>
                    <div class="form-text">Enter 0 for free programs</div>
                  </div>
                </div>
              </div>

              <!-- Accessibility & Inclusivity -->
              <div class="card mt-4">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-universal-access me-2" aria-hidden="true"></i>
                    Accessibility & Inclusivity
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Accessibility Features -->
                  <div class="mb-3">
                    <label class="form-label">Accessibility Features</label>
                    <div class="row g-2">
                      <div v-for="feature in accessibilityOptions" :key="feature" class="col-md-6">
                        <div class="form-check">
                          <input
                            :id="`accessibility-${feature}`"
                            type="checkbox"
                            class="form-check-input"
                            :value="feature"
                            v-model="form.accessibility"
                          />
                          <label :for="`accessibility-${feature}`" class="form-check-label">
                            {{ feature }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Inclusivity Tags -->
                  <div class="mb-3">
                    <label for="inclusivity-tag-input" class="form-label">Inclusivity Tags</label>
                    <div class="input-group mb-2">
                      <input
                        id="inclusivity-tag-input"
                        type="text"
                        class="form-control"
                        v-model="newInclusivityTag"
                        @keyup.enter="addInclusivityTag"
                        placeholder="Type a tag and press Enter"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="addInclusivityTag"
                        :disabled="!newInclusivityTag.trim()"
                      >
                        Add Tag
                      </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <span
                        v-for="(tag, index) in form.inclusivityTags"
                        :key="index"
                        class="badge bg-primary"
                      >
                        {{ tag }}
                        <button
                          type="button"
                          class="btn-close btn-close-white ms-2"
                          @click="removeInclusivityTag(index)"
                          :aria-label="`Remove ${tag} tag`"
                        ></button>
                      </span>
                    </div>
                    <div class="form-text">Examples: beginner-friendly, women-only, LGBTQ+ friendly, family-oriented</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule Section -->
            <div class="col-md-4">
              <div class="card sticky-top" style="top: 2rem;">
                <div class="card-header">
                  <h5 class="card-title mb-0">
                    <i class="bi bi-calendar-event me-2" aria-hidden="true"></i>
                    Schedule
                  </h5>
                </div>
                <div class="card-body">
                  <!-- Days -->
                  <div class="mb-3">
                    <label class="form-label">
                      Days <span class="text-danger">*</span>
                    </label>
                    <div class="d-flex flex-wrap gap-2">
                      <div v-for="day in dayOptions" :key="day.value" class="form-check">
                        <input
                          :id="`day-${day.value}`"
                          type="checkbox"
                          class="form-check-input"
                          :value="day.value"
                          v-model="form.schedule.days"
                          @change="onInput('scheduleDays')"
                        />
                        <label :for="`day-${day.value}`" class="form-check-label">
                          {{ day.label }}
                        </label>
                      </div>
                    </div>
                    <div v-if="touched.scheduleDays && errors.scheduleDays" class="text-danger small mt-1">
                      {{ errors.scheduleDays }}
                    </div>
                  </div>

                  <!-- Start Time -->
                  <div class="mb-3">
                    <label for="start-time" class="form-label">
                      Start Time <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div class="col-7">
                        <select
                          id="start-hour"
                          class="form-select form-select-sm"
                          v-model="form.schedule.startHour"
                          @change="onInput('startTime')"
                        >
                          <option value="">Hour</option>
                          <option v-for="hour in hourOptions" :key="hour" :value="hour">
                            {{ hour }}
                          </option>
                        </select>
                      </div>
                      <div class="col-5">
                        <select
                          id="start-minute"
                          class="form-select form-select-sm"
                          v-model="form.schedule.startMinute"
                          @change="onInput('startTime')"
                        >
                          <option value="">Min</option>
                          <option v-for="minute in minuteOptions" :key="minute" :value="minute">
                            {{ minute }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div v-if="touched.startTime && errors.startTime" class="text-danger small mt-1">
                      {{ errors.startTime }}
                    </div>
                  </div>

                  <!-- End Time -->
                  <div class="mb-3">
                    <label for="end-time" class="form-label">
                      End Time <span class="text-danger">*</span>
                    </label>
                    <div class="row g-2">
                      <div class="col-7">
                        <select
                          id="end-hour"
                          class="form-select form-select-sm"
                          v-model="form.schedule.endHour"
                          @change="onInput('endTime')"
                        >
                          <option value="">Hour</option>
                          <option v-for="hour in hourOptions" :key="hour" :value="hour">
                            {{ hour }}
                          </option>
                        </select>
                      </div>
                      <div class="col-5">
                        <select
                          id="end-minute"
                          class="form-select form-select-sm"
                          v-model="form.schedule.endMinute"
                          @change="onInput('endTime')"
                        >
                          <option value="">Min</option>
                          <option v-for="minute in minuteOptions" :key="minute" :value="minute">
                            {{ minute }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div v-if="touched.endTime && errors.endTime" class="text-danger small mt-1">
                      {{ errors.endTime }}
                    </div>
                  </div>

                  <!-- Start Date -->
                  <div class="mb-4">
                    <label for="start-date" class="form-label">
                      Start Date <span class="text-danger">*</span>
                    </label>
                    <input
                      id="start-date"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': touched.startDate && errors.startDate }"
                      v-model="form.schedule.startDate"
                      @blur="onBlur('startDate')"
                      @change="onInput('startDate')"
                      :min="minDate"
                      required
                    />
                    <div v-if="touched.startDate && errors.startDate" class="invalid-feedback">
                      {{ errors.startDate }}
                    </div>
                  </div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    class="btn btn-success w-100"
                    :disabled="isSubmitting || !isFormValid"
                  >
                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    <i v-else class="bi bi-rocket-takeoff me-2" aria-hidden="true"></i>
                    {{ isSubmitting ? 'Launching...' : 'Launch Program' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Form data
const form = reactive({
  title: '',
  sport: '',
  ageGroups: [],
  description: '',
  cost: 0,
  accessibility: [],
  inclusivityTags: [],
  schedule: {
    days: [],
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    startDate: ''
  }
});

// Form state
const touched = reactive({
  title: false,
  sport: false,
  ageGroups: false,
  description: false,
  cost: false,
  scheduleDays: false,
  startTime: false,
  endTime: false,
  startDate: false
});

const errors = reactive({
  title: '',
  sport: '',
  ageGroups: '',
  description: '',
  cost: '',
  scheduleDays: '',
  startTime: '',
  endTime: '',
  startDate: ''
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const newInclusivityTag = ref('');

// Form refs
const titleRef = ref(null);
const sportRef = ref(null);
const descriptionRef = ref(null);
const costRef = ref(null);

// Options
const sportOptions = [
  'Football', 'Basketball', 'Tennis', 'Swimming', 'Running', 'Cycling',
  'Yoga', 'Pilates', 'Boxing', 'Martial Arts', 'Dance', 'Volleyball',
  'Badminton', 'Table Tennis', 'Cricket', 'Rugby', 'Netball', 'Golf',
  'Rock Climbing', 'Walking Football', 'Wheelchair Basketball', 'Other'
];

const ageGroupOptions = [
  'Kids (5-12)', 'Teens (13-17)', 'Adults (18-64)', 'Seniors (65+)', 'All Ages'
];

const accessibilityOptions = [
  'Wheelchair Accessible', 'Hearing Loop Available', 'Sign Language Support',
  'Visual Impairment Support', 'Cognitive Support Available', 'Accessible Parking'
];

const dayOptions = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

const hourOptions = Array.from({ length: 24 }, (_, i) => 
  i.toString().padStart(2, '0')
);

const minuteOptions = ['00', '15', '30', '45'];

// Get minimum date (today)
const minDate = computed(() => {
  return new Date().toISOString().split('T')[0];
});

// Validation functions
function validateField(fieldName) {
  let error = '';

  switch (fieldName) {
    case 'title':
      if (!form.title.trim()) {
        error = 'Program title is required.';
      } else if (form.title.trim().length < 3) {
        error = 'Title must be at least 3 characters long.';
      }
      break;

    case 'sport':
      if (!form.sport) {
        error = 'Please select a sport.';
      }
      break;

    case 'ageGroups':
      if (form.ageGroups.length === 0) {
        error = 'Please select at least one age group.';
      }
      break;

    case 'description':
      if (!form.description.trim()) {
        error = 'Program description is required.';
      } else if (form.description.trim().length < 20) {
        error = 'Description must be at least 20 characters long.';
      } else if (form.description.length > 500) {
        error = 'Description must not exceed 500 characters.';
      }
      break;

    case 'cost':
      if (form.cost < 0) {
        error = 'Cost cannot be negative.';
      }
      break;

    case 'scheduleDays':
      if (form.schedule.days.length === 0) {
        error = 'Please select at least one day.';
      }
      break;

    case 'startTime':
      if (!form.schedule.startHour || !form.schedule.startMinute) {
        error = 'Please select start time.';
      }
      break;

    case 'endTime':
      if (!form.schedule.endHour || !form.schedule.endMinute) {
        error = 'Please select end time.';
      } else if (form.schedule.startHour && form.schedule.startMinute) {
        const startTime = parseInt(form.schedule.startHour) * 60 + parseInt(form.schedule.startMinute);
        const endTime = parseInt(form.schedule.endHour) * 60 + parseInt(form.schedule.endMinute);
        if (endTime <= startTime) {
          error = 'End time must be after start time.';
        }
      }
      break;

    case 'startDate':
      if (!form.schedule.startDate) {
        error = 'Please select a start date.';
      } else if (new Date(form.schedule.startDate) < new Date()) {
        error = 'Start date cannot be in the past.';
      }
      break;
  }

  errors[fieldName] = error;
  return !error;
}

function validateAll() {
  return (
    validateField('title') &&
    validateField('sport') &&
    validateField('ageGroups') &&
    validateField('description') &&
    validateField('cost') &&
    validateField('scheduleDays') &&
    validateField('startTime') &&
    validateField('endTime') &&
    validateField('startDate')
  );
}

// Computed properties
const isFormValid = computed(() => {
  return form.title.trim() &&
         form.sport &&
         form.ageGroups.length > 0 &&
         form.description.trim() &&
         form.cost >= 0 &&
         form.schedule.days.length > 0 &&
         form.schedule.startHour &&
         form.schedule.startMinute &&
         form.schedule.endHour &&
         form.schedule.endMinute &&
         form.schedule.startDate &&
         !errors.title &&
         !errors.sport &&
         !errors.ageGroups &&
         !errors.description &&
         !errors.cost &&
         !errors.scheduleDays &&
         !errors.startTime &&
         !errors.endTime &&
         !errors.startDate;
});

// Event handlers
function onBlur(fieldName) {
  touched[fieldName] = true;
  validateField(fieldName);
}

function onInput(fieldName) {
  if (touched[fieldName]) {
    validateField(fieldName);
  }
  // Clear messages on input
  if (errorMessage.value) {
    errorMessage.value = '';
  }
  if (successMessage.value) {
    successMessage.value = '';
  }
}

function addInclusivityTag() {
  const tag = newInclusivityTag.value.trim();
  if (tag && !form.inclusivityTags.includes(tag)) {
    form.inclusivityTags.push(tag);
    newInclusivityTag.value = '';
  }
}

function removeInclusivityTag(index) {
  form.inclusivityTags.splice(index, 1);
}

async function focusFirstError() {
  await nextTick();
  const fieldOrder = [
    { name: 'title', ref: titleRef },
    { name: 'sport', ref: sportRef },
    { name: 'description', ref: descriptionRef },
    { name: 'cost', ref: costRef }
  ];

  for (const { name, ref } of fieldOrder) {
    if (errors[name] && ref.value) {
      ref.value.focus();
      break;
    }
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';

  // Validate all fields
  if (!validateAll()) {
    await focusFirstError();
    return;
  }

  isSubmitting.value = true;

  try {
    // Simulate API call (replace with actual implementation)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // TODO: Save program data to backend/Firestore
    console.log('Program data to save:', {
      ...form,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user-id' // Replace with actual user ID
    });

    successMessage.value = 'Program launched successfully! Participants can now find and join your program.';

    // Redirect after short delay
    setTimeout(() => {
      router.push({ name: 'organizer-account' });
    }, 3000);

  } catch (error) {
    errorMessage.value = 'Failed to launch program. Please try again.';
    console.error('Launch program error:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 12px 12px 0 0;
}

.form-control, .form-select {
  border-radius: 8px;
}

.btn {
  border-radius: 8px;
}

.badge {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
}

.btn-close-white {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .sticky-top {
    position: relative !important;
    top: auto !important;
  }
}
</style>
