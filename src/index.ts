import { Draft } from "immer"

const AutoImmer = Symbol("AutoImmer")

export type Auto<T> = T &
  {
    [key in keyof T]: T[key] extends {}
      ? Auto<T[key]>
      : T[key] extends []
      ? Auto<T[key]>
      : T[key]
  }

type Pointer = (string | number | symbol)[]

export type Proposer<T> = (mutator: Mutator<T>) => void
export type PathedProposer<T> = (path: Pointer, mutator: Mutator<T>) => void

export type Mutator<T> = (draft: Draft<T>) => T | void

export function auto<T extends Object>(
  target: T,
  propose: Proposer<T>
): Auto<T> {
  return fork(
    target,
    (path, func) => {
      propose(draft => {
        let obj = draft
        for (const p of path) {
          // Ignore because typescript doesnt know whats up
          // @ts-ignore
          obj = obj[p]
        }
        func(obj)
      })
    },
    []
  )
}

export function isAuto<T>(o: any): o is Auto<T> {
  return o[AutoImmer]
}

export function fork<T extends Object>(
  target: T,
  propose: PathedProposer<T>,
  path: Pointer
): Auto<T> {
  const base: any = Array.isArray(target) ? [] : {}
  base[AutoImmer] = true
  const proxy = new Proxy(
    base as Auto<T>,
    createProxyHandler(target, path, propose)
  )
  return proxy as Auto<T>
}

function createProxyHandler<T extends Object>(
  obj: T,
  path: Pointer,
  propose: PathedProposer<T>
): ProxyHandler<T> {
  return {
    set(t, prop, val: T) {
      propose(path, draft => {
        // @ts-ignore
        draft[prop] = val
      })
      return true
    },
    has(t, prop) {
      return prop in obj
    },
    getOwnPropertyDescriptor(t, prop) {
      const desc = Object.getOwnPropertyDescriptor(obj, prop)
      return { configurable: true, enumerable: desc && desc.enumerable }
    },
    ownKeys(t) {
      return [
        ...Object.getOwnPropertyNames(obj),
        ...Object.getOwnPropertySymbols(obj)
      ]
    },
    deleteProperty(t, prop) {
      return true
    },
    get(t, prop) {
      // @ts-ignore
      const value = obj[prop]
      if (prop === Symbol.iterator) {
        // Ensure the target object is still iterable
        // @ts-ignore
        const iterator = obj[Symbol.iterator]()
        let i = 0
        return function*() {
          while (true) {
            const n = iterator.next()
            i++
            if (n.done) return
            yield typeof n.value === "object"
              ? fork(n.value, propose, [...path, i])
              : n.value
          }
        }
      } else if (typeof value === "function") {
        // If the value is a function, return a proposed version
        return (...args: any) => {
          let result
          propose(path, draft => {
            // @ts-ignore
            result = draft[prop](...args)
          })
          return result
        }
      } else {
        // If the value is an object or array, fork it
        if (typeof value === "object") {
          return fork(value, propose, [...path, prop])
        }
      }
      return value
    }
  }
}
