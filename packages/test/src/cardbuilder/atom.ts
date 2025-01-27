import { atom } from 'jotai'

const lang = atom<'zh-cn' | 'en-us'>('zh-cn')

export { lang }
