import qs from 'node:querystring'
import axios from 'axios'
import { getqrtoken } from '~/utils/index'

const config = useRuntimeConfig()
const aid = config.public.aid

export default defineEventHandler(async (event) => {
  const { qrsig } = getQuery(event) as { qrsig: string }

  const ptqrtoken = getqrtoken(qrsig)
  const query = qs.stringify({
    u1: 'https://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
    ptqrtoken,
    ptredirect: 0,
    h: 1,
    t: 1,
    g: 1,
    from_ui: 1,
    ptlang: 2052,
    action: `0-0-${Date.now()}`,
    js_ver: 23061410,
    js_type: 1,
    login_sig: '',
    pt_uistyle: 40,
    aid,
    daid: 5,
    o1vId: '9be2659f037be605d1584a111c7af433',
    pt_js_version: 'v1.45.1',
  })
  const url = `https://ssl.ptlogin2.qq.com/ptqrlogin?${query}`

  const { data: ret, headers, status } = (await axios.get(url, {
    headers: {
      Referer: 'https://xui.ptlogin2.qq.com/',
      Cookie: `qrsig=${qrsig}`,
    },
    // validateStatus() { return true },
  }))
  const textArr = ret!.match(/ptuiCB\((.*?)'\)/)[1].split(',')
  const cookieText = headers['set-cookie']?.join('') ?? ''

  if (textArr.length > 2) {
    const firstCode = textArr[0].replace(/'/g, '')

    if (firstCode === '0') {
      const uin = ret.match(/uin=(\d+)&/)?.[1]
      const skey = cookieText.match(/skey=(.*?);/)?.[1] ?? ''
      const superkey = cookieText.match(/superkey=(.*?);/)?.[1] ?? ''

      const url1 = textArr[2].replace(/'/g, '')

      const { data: datatext, headers: headers1 } = await (await axios.get(url1, {
        maxRedirects: 0,
        headers: {
          Referer: url1,
        },
        validateStatus() { return true },
      }))

      const pskey = headers1['set-cookie']?.join('').match(/p_skey=(.*?);/)?.[1]

      if (pskey) {
        // 有了 pskey 就可以进行其他操作了

        // 下方演示为点亮 CF 图标示例。
        // const json_SetSwitchStatus = await (await axios.post(`https://club.vip.qq.com/api/trpc/cf/SetSwitchStatus?g_tk=${get_gtk(pskey)}`, {
        //   switch_type: 1,
        // }, {
        //   headers: {
        //     'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
        //     'Referer': 'https://club.vip.qq.com/guestprivilege?_wv=16777218&_wwv=68&_nav_bgclr=ffffff&_nav_titleclr=ffffff&_nav_txtclr=ffffff&_nav_alpha=0&_wvx=10&_proxy=1&_proxyByURL=1&friend=1464164&trace_detail=base64-eyJhcHBpZCI6Im91dHNpZGUiLCJwYWdlX2lkIjoiMTAifQ%3D%3D',
        //     'Cookie': headers1['set-cookie']?.join('').replace('p_skey=;', ''),
        //   },
        // })).data

        // console.log(json_SetSwitchStatus)

        return { code: 0, msg: '登录成功', uin, skey, pskey, superkey, nick: textArr[5], cookie: cookieText }
      }

      else {
        return { code: 6, msg: `登录成功，获取相关信息失败！${textArr[2]}` }
      }
    }
    else if (firstCode === '65') {
      return { code: 1, msg: '二维码已失效。' }
    }
    else if (firstCode === '66') {
      return { code: 2, msg: '二维码未失效。' }
    }
    else if (firstCode === '67') {
      return { code: 3, msg: '正在验证二维码。' }
    }
    else if (firstCode === '10009') {
      return { code: 6, msg: '需要手机验证码才能登录，此次登录失败' }
    }
    else {
      return { code: 6, msg: textArr[4] }
    }
  }
  else {
    return { code: 6, msg: ret }
  }
})
