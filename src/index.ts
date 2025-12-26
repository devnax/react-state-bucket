import { useEffect, useId, useState } from "react"
import { xv as XV, XVInstanceType } from "xanv"
import youid from "youid";
import { getCookie, setCookie } from "./Cookie";
import Initial from "./Initial";

export type StoreType = "memory" | "session" | "local" | "url" | "cookie"
export type BucketOptions = {
  store?: StoreType;
  data_key?: string;
  onChange?: (key: string, value: any) => void
}

export type InitialBucketData = {
  [key: string]: XVInstanceType
}


export const createBucket = <T extends InitialBucketData>(initial: T, option?: BucketOptions) => {
  option = {
    store: "memory",
    ...option,
  }

  if (!option?.data_key) {
    let data_key = ''
    for (let key in initial) {
      const field = initial[key]
      data_key += key + ':' + JSON.stringify(field.meta) + ';'
    }
    option.data_key = youid(data_key)
  }


  const hooks = new Map<string, Function>()
  const state: Record<keyof T, T[keyof T]> = Initial(initial, option?.data_key || '', option || {}) as Record<keyof T, T[keyof T]>;
  const changes: Record<keyof T, boolean> = {} as any

  const useBucket = () => {
    const id = "rsb_" + useId()
    const [, setState] = useState(0)

    useEffect(() => {
      hooks.set(id, () => setState(Math.random()))
      return () => {
        hooks.delete(id)
      }
    }, [])

    return new Proxy(state, {
      get: (target: any, prop: string) => target[prop],
      set: (target, prop: string, value) => {
        if (!(prop in initial)) {
          throw new Error(`Property ${String(prop)} is not defined in the bucket.`)
        }
        (target as any)[prop as keyof T] = value;
        hooks.forEach((hook) => hook());
        changes[prop as keyof T] = true

        if (option?.onChange && changes[prop as keyof T]) {
          option.onChange(prop as string, value)
        }

        if (typeof window !== 'undefined') {
          value = JSON.stringify(value) as any
          if (option.store === 'session' || option.store === 'local') {
            let storage = option.store === "session" ? sessionStorage : localStorage
            storage.setItem(option.data_key!, JSON.stringify(state))
          } else if (option.store === 'url') {
            let url = new URL(window.location.href)
            url.searchParams.set(option.data_key!, encodeURIComponent(JSON.stringify(state)))
            window.history.replaceState({}, '', url.toString())
          } else if (option.store === 'cookie') {
            setCookie(option.data_key!, JSON.stringify(state))
          }
        }
        return true;
      }
    }) as Record<keyof T, any>
  }

  useBucket.validate = () => {
    try {
      for (let k in initial) {
        initial[k].parse(state[k])
      }
    } catch (error) {
      return false
    }
    return true
  }

  useBucket.isValid = (key: keyof T) => {
    try {
      initial[key].parse(state[key])
    } catch (error) {
      return false
    }
    return true
  }

  useBucket.getChanges = () => {
    const changedData: Partial<Record<keyof T, any>> = {}
    for (let k in changes) {
      if (changes[k as keyof T]) {
        changedData[k as keyof T] = state[k as keyof T]
      }
    }
    return changedData
  }

  useBucket.isChanged = (k: keyof T) => !!changes[k]

  useBucket.errors = () => {
    const errors: Record<string, string> = {}
    for (let k in initial) {
      try {
        initial[k].parse(state[k])
      } catch (error: any) {
        errors[k] = error.message
      }
    }
    return errors
  }

  useBucket.getError = (key: keyof T) => {
    try {
      initial[key].parse(state[key])
    } catch (error: any) {
      return error.message
    }
    return null
  }


  return useBucket
}

export const xv = XV