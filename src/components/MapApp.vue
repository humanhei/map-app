<template>
    <GMapMap :center="center" :zoom="7" style="width: 100%; height: 500px">
    <GMapMarker :items="items" v-for="(location, index) in items" :position="location.pos" :key="index" />
  </GMapMap>
  <br/>
</template>

<script>

export default {
  name: "MapApp",
  props: {
    items: Array,
    center: Object,
  },
};
</script>