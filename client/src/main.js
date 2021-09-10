import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vant from 'vant'
import 'vant/lib/index.css'
import api from './api'
import { Toast } from 'vant'
Vue.prototype.$api = api;
Vue.prototype.$toast = Toast;

Vue.use(Vant)

Vue.config.productionTip = false

let digit = (num, length) => {
  let str = '';
  num = String(num);
  length = length || 2;
  for (let i = num.length; i < length; i++) str += '0';
  return num < Math.pow(10, length) ? str + (num | 0) : num;
}

Vue.filter("toDateString", (time, format) => {
  if (!time) return '';
  if (typeof time === 'string') time = time.replace(/-/g, '/');
  let date = new Date(time || new Date()),
    ymd = [
      digit(date.getFullYear(), 4),
      digit(date.getMonth() + 1),
      digit(date.getDate())
    ],
    hms = [
      digit(date.getHours()),
      digit(date.getMinutes()),
      digit(date.getSeconds())
    ];
  format = format || 'yyyy-MM-dd HH:mm:ss';
  return format.replace(/yyyy/g, ymd[0])
    .replace(/MM/g, ymd[1])
    .replace(/dd/g, ymd[2])
    .replace(/HH/g, hms[0])
    .replace(/mm/g, hms[1])
    .replace(/ss/g, hms[2]);
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
