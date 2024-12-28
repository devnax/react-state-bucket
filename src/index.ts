"use client"
import { useEffect, useId, useMemo, useState } from "react"

export type BucketOptions = {
  store?: "memory" | "session" | "local" | "url"
}

export const createBucket = <IT extends { [key: string]: any }>(initial: IT, option?: BucketOptions) => {
  const hooks = new Map<string, Function>()
  let data = new Map<any, any>()
  let changes = new Map<string, boolean>()

  let _option: BucketOptions = {
    store: "memory",
    ...option,
  }

  for (let key in initial) {
    let value = initial[key]
    data.set(key, value)
    changes.set(key, true)
  }

  const handleStorage = (isLoaded = true) => {
    if (typeof window !== 'undefined') {
      let url = new URL(window.location.href)
      if (_option.store === 'session' || _option.store === 'local') {
        let storage = _option.store === "session" ? sessionStorage : localStorage
        for (let key in initial) {
          let has = storage.getItem(key) !== null
          if (isLoaded || !has) {
            data.has(key) ? storage.setItem(key, data.get(key)) : storage.removeItem(key)
          } else if (has) {
            data.set(key, storage.getItem(key))
          }
        }
      } else if (_option.store === "url") {
        for (let key in initial) {
          let has = url.searchParams.has(key)
          if (isLoaded || !has) {
            data.has(key) ? url.searchParams.set(key, data.get(key)) : url.searchParams.delete(key)
          } else if (has) {
            data.set(key, url.searchParams.get(key))
          }
        }
        window.history.replaceState(null, '', url.toString())
      }
    }
  }

  handleStorage(false)

  let dispatch = () => {
    hooks.forEach(d => {
      try { d() } catch (error) { }
    })
    handleStorage()
  }

  const set = <T extends keyof IT>(key: T, value: IT[T]) => {
    if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the set function. Please verify the structure of the initial state data.`)
    data.set(key, value)
    changes.set(key as string, true)
    dispatch()
  }

  const get = <T extends keyof IT>(key: T): IT[T] => data.get(key)
  const _delete = <T extends keyof IT>(key: T) => {
    data.delete(key)
    changes.set(key as string, true)
    dispatch()
  }

  const clear = () => {
    for (let key in initial) {
      data.delete(key)
      changes.set(key, true)
    }
    dispatch()
  }

  const getState = () => {
    let d: any = {}
    for (let key in initial) {
      d[key] = data.get(key)
    }
    return d as IT
  }

  const setState = (state: Partial<IT>) => {
    for (let key in state) {
      if (!(key in initial)) throw new Error(`(${key}) Invalid key provided in the setState function. Please verify the structure of the initial state data.`)
      data.set(key, state[key] as any)
      changes.set(key, true)
    }
    dispatch()
  }
  const isChange = <T extends keyof IT>(key: T) => changes.get(key as string)
  const getChanges = () => Array.from(changes.keys()).filter((key: string) => changes.get(key as string))
  const clearChanges = () => Array.from(changes.keys()).forEach((key: string) => changes.set(key, false))

  const useHook = () => {
    const id = useId()
    const [d, setUp] = useState(0)

    useEffect(() => {
      hooks.set(id, () => setUp(Math.random()))
      return () => {
        hooks.delete(id)
      }
    }, [])

    const state = useMemo(() => getState(), [d])

    return {
      set,
      get,
      delete: _delete,
      clear,
      getState: () => state,
      setState,
      isChange,
      getChanges,
      clearChanges,
    }
  }

  useHook.set = set
  useHook.get = get
  useHook.delete = _delete
  useHook.clear = clear
  useHook.getState = getState
  useHook.setState = setState
  useHook.isChange = isChange
  useHook.getChanges = getChanges
  useHook.clearChanges = clearChanges

  return useHook
}