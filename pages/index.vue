<script lang="ts" setup>
const message = useMessage()

const { public: { aid } } = useRuntimeConfig()

const qrcodeInfo = ref({
  img: '',
  qrsig: '',
  code: -1,
})

const statusInfo = ref('')

const loginResult = ref<{
  code: number
  uin: string
  skey: string
  pskey: string
  superkey: string
  nick: string
  cookie: string
}>({
  code: -1,
  uin: '',
  skey: '',
  pskey: '',
  superkey: '',
  nick: '',
  cookie: '',
})

let timer: any

async function getqrpic() {
  const res = await $fetch('/api/qq/qrpic')
  qrcodeInfo.value = res
}

async function qrlogin() {
  const res = await $fetch(`/api/qq/qrlogin?qrsig=${qrcodeInfo.value.qrsig}&r=0.8929730296084752`)
  return res
}

// 开始检测二维码状态
function startQrCode() {
  timer = setInterval(async () => {
    const res = await qrlogin()

    statusInfo.value = res.msg
    loginResult.value = res
    if (res.code === 0) {
      message.success('登录成功')
      qrcodeInfo.value.img = ''
      clearInterval(timer)
    }

    if (res.code === 1) {
      message.error(res.msg)
      await getqrpic()
      message.warning('已更换登录二维码')
    }

    if (res.code === -1) {
      clearInterval(timer)
      message.error(res.msg)
    }
  }, 5000)
}

async function handleBeforeLeave(tabName: string) {
  switch (tabName) {
    case 'qrcode':
      getqrpic()
      startQrCode()
      return true
    default:
      clearInterval(timer)
      return true
  }
}

const form = ref({
  uin: '',
  password: '',
})

const showCaptchaModal = ref(false)

const checkResult = ref<{
  vcode: string
  sid: string
  sig: string
  pt_verifysession: string
  cookie: string
}>({
  vcode: '',
  sid: '',
  sig: '',
  pt_verifysession: '',
  cookie: '',
})
// 检测是否需要验证
async function checkvc(uin: string) {
  const res = (await $fetch(`/api/qq/checkvc?uin=${uin}`))

  checkResult.value = res
  statusInfo.value = '登录中, 请稍后...'

  if (res.code === 0) {
    message.success('登录成功')
  }
  else if (res.code === 1) {
    // 获取验证码frame
    showCaptchaModal.value = true
  }
}

async function handleSuccess(params: { randstr: string; ticket: string }) {
  showCaptchaModal.value = false

  const isMd5 = null

  const { randstr, ticket } = params
  checkResult.value.vcode = randstr
  checkResult.value.pt_verifysession = ticket

  const res = await $fetch('/api/qq/login', {
    method: 'POST',
    body: {
      uin: form.value.uin,
      pwd: form.value.password,
      p: (window as any).encryption(form.value.uin, form.value.password, checkResult.value.vcode, isMd5),
      vcode: checkResult.value.vcode,
      pt_verifysession: checkResult.value.pt_verifysession,
      sid: checkResult.value.sid,
      cookie: checkResult.value.cookie,
    },
  })

  if (res?.msg) {
    message.success(res?.msg)
    statusInfo.value = res?.msg
    loginResult.value = res
  }
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = '//lib.baomitu.com/jquery/1.12.4/jquery.min.js'

  script.onload = () => {
    const script1 = document.createElement('script')
    script1.src = '/js/encryption.js'
    document.head.appendChild(script1)
  }
  document.head.appendChild(script)
})
</script>

<template>
  <div class="flex flex-col justify-center items-center ">
    <n-card title="qq 登录">
      <n-tabs
        class="card-tabs mb-4"
        default-value="password"
        size="large"
        animated
        justify-content="space-evenly"
        @before-leave="handleBeforeLeave"
      >
        <n-tab-pane name="password" tab="密码登录">
          <n-form :model="form" label-placement="left" label-width="50px">
            <n-form-item-row label="qq">
              <n-input v-model:value="form.uin" />
            </n-form-item-row>
            <n-form-item-row label="密码">
              <n-input v-model:value="form.password" />
            </n-form-item-row>
          </n-form>
          <n-button type="primary" block secondary strong @click="checkvc(form.uin)">
            登录
          </n-button>
          <CaptchaModal v-if="showCaptchaModal" v-model:show="showCaptchaModal" :aid="aid" :uin="form.uin" :sid="checkResult.sid" @success="handleSuccess" />
        </n-tab-pane>
        <n-tab-pane name="qrcode" tab="扫码登录">
          <div v-if="loginResult.code !== 0" class="flex flex-col justify-center items-center">
            <span>使用QQ手机版扫描二维码</span>
            <img width="200" height="200" :src="qrcodeInfo.img" alt="">
          </div>
        </n-tab-pane>
      </n-tabs>
      <n-alert v-if="statusInfo" :show-icon="false" type="info">
        {{ statusInfo }}
      </n-alert>

      <n-alert v-if="loginResult.code === 0" mt-2 class="flex flex-col justify-center items-center">
        <p v-for="[key, value] in Object.entries(loginResult)" :key="key">
          <span font-600> {{ key }}</span> : <span>{{ value }}</span>
        </p>
      </n-alert>
    </n-card>
  </div>
</template>
