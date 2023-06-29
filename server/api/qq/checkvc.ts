import qs from 'node:querystring'

import axios from 'axios'

const config = useRuntimeConfig()
const aid = config.public.aid

export default defineEventHandler(async (event) => {
  const { uin } = getQuery(event) as { uin: string }

  if (!/^[1-9][0-9]{4,13}$/.test(uin))
    return { code: -2, msg: 'QQ号码不正确' }

  const query = qs.stringify({
    proxy_url: 'https://qzs.qq.com/qzone/v6/portal/proxy.html',
    daid: 5,
    hide_title_bar: 1,
    low_login: 0,
    qlogin_auto_login: 1,
    no_verifyimg: 1,
    link_target: 'blank',
    appid: aid,
    style: 22,
    target: 'self',
    s_url: 'https://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
    pt_no_auth: 0,
  })
  const url = `https://xui.ptlogin2.qq.com/cgi-bin/xlogin?${query}`

  const { data: response, headers } = await (await axios.get(url))

  let cookieText = headers['set-cookie']?.join('') ?? ''

  const pt_login_sig = cookieText.match(/pt_login_sig=(.*?);/)?.[1] ?? ''

  // const js_ver = response.match(/ver\/(\d+)/)?.[1] ?? ''
  const js_ver = '22080914'

  // 获取验证码
  const query2 = qs.stringify({
    regmaster: '',
    pt_tea: 2,
    pt_vcode: 1,
    uin,
    appid: config.aid,
    js_ver,
    js_type: 1,
    login_sig: pt_login_sig,
    u1: 'https://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
    r: `0.${Date.now()}722706`,
    pt_uistyle: 25,
  })
  const url2 = `https://ssl.ptlogin2.qq.com/check?${query2}`

  const { data: response2, headers: headers2 } = (await axios.get(url2, {
  }))

  cookieText += headers2['set-cookie']?.join('')

  cookieText = cookieText.replace(/PATH=\/; DOMAIN=.*?; SameSite=None; Secure|confirmuin=0;Path=\/;Domain=.*?;Secure;/g, '')

  const vcMatch = response2.match(/ptui_checkVC\('(.*?)'\)/)

  if (!vcMatch) {
    return {
      code: -3,
      msg: `获取验证码失败${response2}`,
    }
  }

  const r = vcMatch[1].split('\',\'')
  if (r[0] === '0') { // 无需验证码
    return {
      code: 0,
      uin,
      vcode: r[1],
      pt_verifysession: r[3], // 验证后的 seesion
      sid: r[6],
      cookie: cookieText,
    }
  }
  else { // 需要验证码
    return {
      code: 1,
      uin,
      sig: r[1], // 验证码签名 cap_cd
      sid: r[6],
      cookie: cookieText,
    }
  }
})
