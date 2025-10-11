<template>
    
    <pre>{{ JSON.stringify(count, null, 2) }}</pre>
      
  </template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      count: null,
      error: null,
      loading: true,
    };
  },
  async mounted() {
    await this.getBookCountAPI();
  },
  methods: {
    async getBookCountAPI() {
      try {
        this.loading = true;
        const response = await axios.get('https://countbooks-smp7udltza-uc.a.run.app');
        this.count = response.data;
        this.error = null;
      } catch (error) {
        console.error('Error fetching book count:', error);
        this.error = error;
        this.count = null;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
