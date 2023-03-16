import Vue from 'vue';
import YmapPlugin from 'vue-yandex-maps';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),

}).$mount('#app');

Vue.use(YmapPlugin, {
  // API-ключ yandex maps
  apiKey: 'b4636411-1572-423e-9f03-825ef98cd096',
  lang: 'ru_RU',
  coordorder: 'lat-long',
  version: '2.1',
});
