import CryptoJS from 'crypto-js'

export function MD5(text: string) {
  return CryptoJS.MD5(text).toString()
}
