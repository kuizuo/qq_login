import qs from 'node:querystring'
import axios from 'axios'

const config = useRuntimeConfig()
const aid = config.public.aid

export default defineEventHandler(async () => {
  const query = qs.stringify({
    u1: 'https://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
    appid: aid,
    e: 2,
    l: 'M',
    s: 3,
    d: 72,
    v: 4,
    t: Math.random(),
    daid: 5,
    pt_3rd_aid: 0,
  })
  const url = `https://ssl.ptlogin2.qq.com/ptqrshow?${query}`

  const { data, headers } = await (await axios.get(url, {
    headers: {
      Referer: 'https://xui.ptlogin2.qq.com/',
    },
    responseType: 'arraybuffer',
  }))

  const qrsig = headers['set-cookie']?.toString()!.match(/qrsig=(.*?);/)?.[1]

  const imgBase64 = `data:image/;base64,${data.toString('base64')}`

  return { img: imgBase64, qrsig, code: 0 }
})
