import { useEffect, useId, useState } from "react"
import { Infer, xv as XV, XVInstanceType } from "xanv"
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
  const state: Record<keyof T, any> = Initial(initial, option?.data_key || '', option || {}) as Record<keyof T, any>;
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

    const get = (key: keyof T, defaultValue?: any) => {
      if (!(key in initial)) {
        throw new Error(`Property ${String(key)} is not defined in the bucket.`)
      }
      let value = state[key];
      if (value === undefined && defaultValue !== undefined) {
        value = defaultValue
      }
      return value;
    }

    const set = (key: keyof T, value: any) => {
      if (!(key in initial)) {
        throw new Error(`Property ${String(key)} is not defined in the bucket.`)
      }
      state[key] = value;
      hooks.forEach((hook) => hook());
      changes[key] = true

      if (option?.onChange && changes[key]) {
        option.onChange(key as string, value)
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
    }

    const validate = () => {
      try {
        for (let k in initial) {
          initial[k].parse(state[k])
        }
      } catch (error) {
        return false
      }
      return true
    }

    const isValid = (key: keyof T) => {
      try {
        initial[key].parse(state[key])
      } catch (error) {
        return false
      }
      return true
    }

    const getChanges = () => {
      const changedData: Partial<Record<keyof T, any>> = {}
      for (let k in changes) {
        if (changes[k as keyof T]) {
          changedData[k as keyof T] = state[k as keyof T]
        }
      }
      return changedData
    }

    const isChanged = (k: keyof T) => !!changes[k]

    const errors = () => {
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

    const getError = (key: keyof T) => {
      try {
        initial[key].parse(state[key])
      } catch (error: any) {
        return error.message
      }
      return null
    }

    return { state, get, set, validate, isValid, getChanges, isChanged, errors, getError }
  }

  return useBucket
}

export const xv = XV