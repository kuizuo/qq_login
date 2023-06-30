import qs from 'node:querystring'
import axios from 'axios'

interface Query {
  uin: string
  pwd: string
  p: string
  sid: string
  vcode: string
  pt_verifysession: string
  sms_code: string
  cookie: string
}

const config = useRuntimeConfig()
const aid = config.public.aid

export default defineEventHandler(async (event) => {
  const { uin, p, sid, pt_verifysession, pwd, vcode, cookie } = await readBody(event) as unknown as Query

  const v1 = vcode.includes('!') ? 0 : 1
  const pt_login_sig = cookie.match(/pt_login_sig=(.*?);/)?.[1]
  const ptdrvs = cookie.match(/ptdrvs=(.*?);/)?.[1]

  const query = qs.stringify({
    u: uin,
    verifycode: vcode,
    pt_vcode_v1: v1,
    pt_verifysession_v1: pt_verifysession,
    p,
    pt_randsalt: '2',
    u1: 'https://qzs.qq.com/qzone/v5/loginsucc.html?para=izone',
    ptredirect: '0',
    h: '1',
    t: '1',
    g: '1',
    from_ui: '1',
    ptlang: '2052',
    action: `7-3-${Date.now()}`,
    js_ver: '23061410',
    js_type: '1',
    login_sig: pt_login_sig,
    pt_uistyle: '40',
    aid,
    daid: '5',
    ptdrvs,
    sid,
    o1vId: '9be2659f037be605d1584a111c7af433',
    pt_js_version: 'v1.45.1',
  })
  const url = `https://ssl.ptlogin2.qq.com/login?${query}`

  const { data: ret, headers } = (await axios.get(url, {
    headers: {
      Referer: 'https://xui.ptlogin2.qq.com/cgi-bin/xlogin?proxy_url=https%3A//qzs.qq.com/qzone/v6/portal/proxy.html&daid=5&&hide_title_bar=1&low_login=0&qlogin_auto_login=0&no_verifyimg=1&link_target=blank&appid=549000912&style=22&target=self&s_url=https%3A%2F%2Fqzs.qq.com%2Fqzone%2Fv5%2Floginsucc.html%3Fpara%3Dizone&pt_no_auth=0',
      Cookie: cookie,
    },
    // validateStatus() { return true },
  }))

  let setCookie = ''
  const match = ret.match(/ptuiCB\('(.*?)'\)/)

  if (match) {
    const r = match[1].replace('\', \'', '\',\'').split('\',\'')
    if (r[0] === 0) {
      const skeyMatch = ret.match(/skey=@(.{9});/)
      const superkeyMatch = ret.match(/superkey=(.*?);/)

      const { data } = (await axios.get(r[2]))

      let pskey = ''
      if (data) {
        const matchs = data.match(/p_skey=(.*?);/)
        if (matchs)
          pskey = matchs[1]
      }

      if (skeyMatch?.[1] && pskey) {
        return {
          code: 0,
          uin,
          skey: `@${skeyMatch[1]}`,
          pskey,
          superkey: superkeyMatch?.[1],
          nick: encodeURIComponent(r[5]),
          loginurl: r[2],
        }
      }
      else {
        if (!pskey)
          return { code: -3, msg: `登录成功，获取P_skey失败！${r[2]}` }
        else if (!skeyMatch?.[1])
          return { code: -3, msg: '登录成功，获取Skey失败！' }
      }
    }
    else if (r[0] === 4) {
      return { code: 4, msg: '验证码错误' }
    }
    else if (r[0] === 3) {
      return { code: 3, msg: '密码错误' }
    }
    else if (r[0] === 19) {
      return { code: 19, uin, msg: '您的帐号暂时无法登录，请到 http://aq.qq.com/007 恢复正常使用' }
    }
    else if (r[0] === 10009) {
      const smsTicketMatch = ret.match(/pt_sms_ticket=(.*?);/)
      const ptdrvsNewMatch = ret.match(/ptdrvs=(.*?);/)
      setCookie = cookie.replace(ptdrvs, ptdrvsNewMatch?.[1])
      return {
        code: 10009,
        sms_ticket: smsTicketMatch?.[1],
        cookie: setCookie,
        msg: `请通过密保手机${r[4]}获取短信验证码`,
      }
    }
    else if (r[0] === 10010) {
      return { code: 10010, msg: r[4] }
    }
    else if (r[0] === 10005 || r[0] === 10006 || r[0] === 22009) {
      return { code: 10005, msg: '登录环境异常（异地登录或IP存在风险），请使用QQ手机版扫码登录！' }
    }
    else {
      return { code: r[0], msg: r[4] }
    }
  }
  else {
    return { code: -2, msg: ret }
  }
})
