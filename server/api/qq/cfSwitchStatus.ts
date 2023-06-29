import axios from 'axios'
import { get_gtk } from '~/utils/index'

export default defineEventHandler(async (event) => {
  const { pskey } = getQuery(event)

  const json_SetSwitchStatus = await (await axios.post(`https://club.vip.qq.com/api/trpc/cf/SetSwitchStatus?g_tk=${get_gtk(pskey as string)}`, {
    switch_type: 1,
  }, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36',
      'Referer': 'https://club.vip.qq.com/guestprivilege?_wv=16777218&_wwv=68&_nav_bgclr=ffffff&_nav_titleclr=ffffff&_nav_txtclr=ffffff&_nav_alpha=0&_wvx=10&_proxy=1&_proxyByURL=1&friend=1464164&trace_detail=base64-eyJhcHBpZCI6Im91dHNpZGUiLCJwYWdlX2lkIjoiMTAifQ%3D%3D',
    },
  })).data

  return json_SetSwitchStatus
})
