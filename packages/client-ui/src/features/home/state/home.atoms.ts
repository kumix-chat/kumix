import { atom } from "jotai"

export const homeCountAtom = atom(0)
export const homeIncrementActionAtom = atom(null, (get, set) => {
  set(homeCountAtom, get(homeCountAtom) + 1)
})

export const homeShowMessageAtom = atom(false)
export const homeShowMessageActionAtom = atom(null, (_get, set) => {
  set(homeShowMessageAtom, true)
})

