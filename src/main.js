import { createApp } from 'vue'
import App from './App.vue'
import SmartTable from 'vuejs-smart-table'
import VueGoogleMaps from '@fawmi/vue-google-maps'

import 'bootstrap/dist/css/bootstrap.css'

createApp(App)
	.use(SmartTable)
	.use(VueGoogleMaps, {
		load: {
			key: 'AIzaSyDzHMfu1uVshFyDcUVtI2EDAgaX8CJ_5a0',
			libraries: "places",
		},
	}).mount('#app')
