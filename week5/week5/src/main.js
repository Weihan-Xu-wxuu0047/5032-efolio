import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ColumnGroup from 'primevue/columngroup';
import Row from 'primevue/row';


const app  = createApp(App);
app.use(PrimeVue,{
    theme:{
        preset:Aura
    }
}
)

app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('ColumnGroup', ColumnGroup);
app.component('Row', Row);

app.mount('#app')
