import Vue from "vue";
import App from "./App.vue";

export function init() {
  return new Vue({
    render: (h) => h(App)
  });
}
