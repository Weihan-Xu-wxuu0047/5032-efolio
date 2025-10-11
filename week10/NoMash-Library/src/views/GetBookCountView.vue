<template>
    <div id="app">
      <h1>Book Counter</h1>
      <button @click="getBookCount">Get Book Count</button>
      <p v-if="count !== null">Total number of books: {{ count }}</p>
      <p v-if="error">{{ error }}</p>
    </div>
  </template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      jsondata: null,
      error: null
    };
  },
  mounted() {
    this.getBookCountAPI();
  },
  
};
</script>
