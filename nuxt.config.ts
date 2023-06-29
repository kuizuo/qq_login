export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      aid: process.env.AID, // 改成你要登录的应用的 aid    8000201 为 qq 会员
    },
  },
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
    ['@pinia/nuxt', {
      autoImports: ['defineStore', 'definePiniaStore'],
    }],
    '@nuxtjs/color-mode',
    '@huntersofbook/naive-ui-nuxt',
  ],
  unocss: {
    uno: true,
    icons: true,
    attributify: true,
    preflight: false,
  },
  naiveUI: {
    themeOverrides: {
      common: {
        primaryColor: '#3798fc',
        primaryColorHover: '#69adff',
      },
    },
  },
  imports: {
    dirs: [
      'composables/**/*',
      'stores/**/*',
    ],
  },
})
