<script setup lang="ts">
import 'assets/css/preflight.css'
import { darkTheme, dateZhCN, lightTheme, zhCN } from 'naive-ui'

const colorMode = useColorMode()

useHead({
  title: 'qq 扫码登录',
  link: [
    {
      rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg',
    },
  ],
})
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="colorMode.preference === 'dark' ? darkTheme : lightTheme">
    <n-global-style />
    <NuxtLayout>
      <n-message-provider keep-alive-on-hover>
        <NuxtLoadingIndicator />
        <NuxtPage />
      </n-message-provider>
    </NuxtLayout>
  </n-config-provider>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  background: #222;
  color: white;
}
</style>
