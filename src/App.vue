<template>
  <div class="padCom">
    <h1 style="text-align: center;">Location App</h1>
    <div class="input-group mb-3">
      <GMapAutocomplete
        class="form-control"
        @place_changed="setPlace"
        @keyup.enter="addLoc"
        placeholder="Enter Location"/>
      <button class="btn btn-outline-primary" type="button" @click="addLoc">Add Location</button>
      <button class="btn btn-outline-secondary" type="button" @click="getCurrentPosition">Get Current Posistion</button>
    </div>
    <transition name="fade" mode="out-in">
      <div v-if="warningMsg" class="alert alert-warning d-flex align-items-center" role="alert">
        Location entered is not found
      </div>
    </transition>
  </div>
  <MapApp :items="locItems" :center="center"/>
  <LocTable :items="locItems" @delLoc="delLoc" class="padCom"/>
</template>

<script>
import MapApp from './components/MapApp.vue'
import LocTable from './components/LocTable.vue'

import axios from 'axios'

const GOOGLE_MAP_API_KEY = 'AIzaSyDzHMfu1uVshFyDcUVtI2EDAgaX8CJ_5a0'

export default {
  name: 'App',
  components: {
    MapApp,
    LocTable
  },
  data() {
    return {
      searchTerm: '',
      locItems: [], // Array to store the added text
      center: { lat: 43.653226, lng: -79.3831843 },
      warningMsg: false
    };
  },
  methods: {
    setPlace(place) {
      this.searchTerm = place; // Save result when finished input a place
    },
    getCoordinates() {
      return new Promise(function(resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    })},
    async getCurrentPosition() {
      if (navigator.geolocation) {
        const { coords } = await this.getCoordinates();
        const { latitude, longitude } = coords;
        const pos = { lat: latitude, lng: longitude }
        const { data: currLocData } = await axios
          .get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${GOOGLE_MAP_API_KEY}`)
        const now = (Date.now() / 1000).toFixed(0);
        const { data: timezone } = await axios
          .get(`https://maps.googleapis.com/maps/api/timezone/json?location=${pos.lat},${pos.lng}&timestamp=${now}&key=${GOOGLE_MAP_API_KEY}`)
        const { timeZoneName, dstOffset, rawOffset } = timezone;
        const localTime = new Date((Number(now) + dstOffset + rawOffset) * 1000);
        const localTimeStr = `${localTime.getUTCHours().toString().padStart(2, '0')}:${localTime.getUTCMinutes().toString().padStart(2, '0')}`
        this.locItems.push({ locName: currLocData.results[0].formatted_address, pos, timeZoneName, localTimeStr, checked: false });
        this.center = pos;
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    },
    async addLoc() {
      if (this.searchTerm && this.searchTerm.geometry) {
        // Get Latitude and Longtitude of the place
        const { lat, lng } = this.searchTerm.geometry.location;
        const pos = { lat: lat(), lng: lng() };
        // Get Timezone and Local Time of the place using lat and lng
        const now = (Date.now() / 1000).toFixed(0);
        const { data: timezone } = await axios
          .get(`https://maps.googleapis.com/maps/api/timezone/json?location=${pos.lat},${pos.lng}&timestamp=${now}&key=${GOOGLE_MAP_API_KEY}`)
        const { timeZoneName, dstOffset, rawOffset } = timezone;
        const localTime = new Date((Number(now) + dstOffset + rawOffset) * 1000);
        const localTimeStr = `${localTime.getUTCHours().toString().padStart(2, '0')}:${localTime.getUTCMinutes().toString().padStart(2, '0')}`
        this.locItems.push({ locName: this.searchTerm.name, pos, timeZoneName, localTimeStr, checked: false });
        this.center = pos;
      } else {
        this.warningMsg = true;
        setTimeout(() => {
          this.warningMsg = false
        }, 5000)
      }
    },
    delLoc() {
      this.locItems = this.locItems.filter((item) => !item.checked);
    },
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  text-align: center;
  margin-top: 60px;
  margin-bottom: 60px;
}
.padCom {
  padding-left: 5%;
  padding-right: 5%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
