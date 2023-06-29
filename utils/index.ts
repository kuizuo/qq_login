// 传入 pskey 获取gtk
export function get_gtk(pskey: string) {
  let hash = 5381
  for (let i = 0, len = pskey.length; i < len; ++i)
    hash += (hash << 5) + pskey.charAt(i).charCodeAt(0)

  return hash & 0x7FFFFFFF
}

export function getqrtoken(t) {
  let e = 0
  let n = 0
  const o = t.length
  while (n < o) {
    e += (e << 5) + t.charCodeAt(n)
    n++
  }
  return 2147483647 & e
}
