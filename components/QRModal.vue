<script setup lang="ts">
const props = defineProps<{
  img: ''
  qrcode: ''
  qrsig: ''
  code: ''
}>()

const emit = defineEmits<{
  (e: 'success', param: Record<string, any>): void
}>()
</script>

<template>
  <div>
    <n-modal
      :mask-closable="false"
      preset="dialog"
      title="扫码登录"
    >
      <img width="200" height="200" :src="props.img" alt="">
    </n-modal>
  </div>
</template>

<style scoped>

</style>
