<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import IconifyLink from './components/IconifyLink.vue';
</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <i- name="logos:vitejs" class="logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <i- name="logos:vue" class="logo vue" />
    </a>
    <IconifyLink />
  </div>
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
a {
  display: inline-block;
}
.logo {
  font-size: 6rem;
  width: 1em;
  height: 1em;
  padding: 1.5rem;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2rem #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2rem #42b883aa);
}
</style>
