<template>
<div class="container">
  <div class="header">
    <h1>WEATHER APP</h1>
    <div class="search-bar">
      <input
        type="text"
        v-model="city"
        placeholder="Enter city name"
        class="search-input"
      />
      <button @click="searchByCity" class="search-button">Search</button>
    </div>
  </div>
</div>

      <main>
        
        <div v-if="weatherData">
          <h2>
              {{ weatherData.name }}, {{ weatherData.sys.country }}
          </h2>
          <div>
            
            <img :src="iconUrl" alt="Weather Icon" />
            <p>{{ temperature }} °C</p>
          </div>
          
          <span>{{ weatherData.weather[0].description }}</span>
        </div>
      </main>
</template>

<script>
  
  import axios from "axios";

  const apikey = "d73f25483890a8c22555a25adc502ef1";
  
  export default {
    name: "App",
    data() {
      return {
        city: "",
        weatherData: null,
        hourlyForecast: [],
        dailyForecast: [],
      };
    },
   computed: {
     temperature() {
        return this.weatherData
          ? Math.floor(this.weatherData.main.temp - 273)
          : null;
      },
      
      iconUrl() {
        return this.weatherData
          ? `http://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
          : null;
      },
    },
   
    mounted() {
      this.fetchCurrentLocationWeather();
    },
    methods: {
     
      async fetchCurrentLocationWeather() {
        
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
           
            await this.fetchWeatherData(url);
          });
        }
      },
      async fetchWeatherData(url) {
        try {
          const response = await axios.get(url);
          //Returned data from API is stored as JSON file in weatherData
          this.weatherData = response.data;
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      },
      async searchByCity() {
        if (this.city.trim()) {
          //API link to obtain the current weather based on city name
          const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.city)}&appid=${apikey}`;
          await this.fetchWeatherData(url);
        }
      },
    },
  };
</script>