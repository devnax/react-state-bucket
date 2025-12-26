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
  const errors: Record<keyof T, string> = {} as any

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

    const set = (key: keyof T, value: any, dispatch = true) => {
      if (!(key in initial)) {
        throw new Error(`Property ${String(key)} is not defined in the bucket.`)
      }
      state[key] = value;
      if (dispatch) {
        hooks.forEach((hook) => hook());
      }
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

    const _delete = (key: keyof T) => {
      set(key, undefined)
    }

    const clear = () => {
      const initVal = Initial(initial, option?.data_key || '', option || {}) as Record<keyof T, any>;
      for (let key in initial) {
        state[key] = initVal[key];
        delete changes[key]
      }
      hooks.forEach((hook) => hook());
    }

    const getChanges = () => {
      const changedData: Partial<Record<keyof T, any>> = {}
      for (let k in changes) {
        if (changes[k]) {
          changedData[k] = state[k]
        }
      }
      return changedData
    }

    const isChanged = (k: keyof T) => !!changes[k]

    const isValid = (key: keyof T) => {
      try {
        initial[key].parse(state[key])
      } catch (error: any) {
        errors[key] = (error as any).message
      }
      hooks.forEach((hook) => hook());
      return !(key in errors)
    }

    const validate = () => {
      for (let k in initial) {
        try {
          initial[k].parse(state[k])
        } catch (error: any) {
          errors[k] = (error as any).message
        }
      }
      hooks.forEach((hook) => hook());
      return Object.keys(errors).length === 0
    }

    const getError = (key: keyof T) => {
      if (key in errors) {
        return errors[key]
      }
      return ''
    }

    const getErrors = () => {
      return errors
    }

    const setError = (key: keyof T, message: string) => {
      errors[key] = message
      hooks.forEach((hook) => hook());
    }

    const clearErrors = () => {
      for (let k in errors) {
        delete errors[k]
      }
      hooks.forEach((hook) => hook());
    }

    const clearError = (key: keyof T) => {
      delete errors[key]
      hooks.forEach((hook) => hook());
    }


    return {
      state,
      get,
      set,
      delete: _delete,
      clear,
      validate,
      isValid,
      getChanges,
      isChanged,
      getErrors,
      getError,
      setError,
      clearErrors,
      clearError
    }
  }

  return useBucket
}

export const xv = XV