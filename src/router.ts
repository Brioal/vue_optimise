import Vue from 'vue';
import Router from 'vue-router';
const Home = () => import(/* webpackChunkName: "group-home" */ './views/Home.vue');
const About = () => import(/* webpackChunkName: "group-home" */ './views/About.vue');

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/about',
      name: 'about',
      component:About ,
    },
  ],
});
