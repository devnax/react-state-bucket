
import { useEffect, useId, useMemo, useState } from "react"

export type BucketOptions = {
  store?: "memory" | "session" | "local" | "url",
  onChange?: (key: string, value: any, type: "set" | "delete") => void
}

export const createBucket = <IT extends { [key: string]: any }>(initial: IT, option?: BucketOptions) => {
  const hooks = new Map<string, Function>()
  let data = new Map<any, any>()
  let changes = new Map<string, boolean>()

  let _option: BucketOptions = {
    store: "memory",
    ...option,
  }

  let dispatch = () => {
    hooks.forEach(d => {
      try { d() } catch (error) { }
    })
  }

  const set = <T extends keyof IT>(key: T, value: IT[T]) => {
    if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the set function. Please verify the structure of the initial state data.`)

    if (typeof window !== 'undefined' && (_option.store === 'session' || _option.store === 'local')) {
      let storage = _option.store === "session" ? sessionStorage : localStorage
      storage.setItem(key as string, JSON.stringify(value))
    } else if (typeof window !== 'undefined' && _option.store === 'url') {
      let url = new URL(window.location.href)
      url.searchParams.set(key as string, JSON.stringify(value))
      window.history.replaceState({}, '', url.toString())
    } else {
      data.set(key, value)
    }
    if (_option.onChange) {
      _option.onChange(key as string, value, 'set')
    }
    changes.set(key as string, true)
    dispatch()
  }

  const get = <T extends keyof IT>(key: T): IT[T] => {
    if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the get function. Please verify the structure of the initial state data.`)
    if (typeof window !== 'undefined' && (_option.store === 'session' || _option.store === 'local')) {
      let storage = _option.store === "session" ? sessionStorage : localStorage
      let storedValue = storage.getItem(key as string)!
      try {
        return JSON.parse(storedValue)
      } catch {
        return storedValue as any
      }
    } else if (typeof window !== 'undefined' && _option.store === 'url') {
      let url = new URL(window.location.href)
      let storedValue = url.searchParams.get(key as string)!
      try {
        return JSON.parse(storedValue)
      } catch {
        return storedValue as any
      }
    }
    return data.get(key)
  }


  const _delete = <T extends keyof IT>(key: T) => {
    if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the delete function. Please verify the structure of the initial state data.`)

    if (typeof window !== 'undefined' && (_option.store === 'session' || _option.store === 'local')) {
      let storage = _option.store === "session" ? sessionStorage : localStorage
      storage.removeItem(key as string)
    } else if (typeof window !== 'undefined' && _option.store === 'url') {
      let url = new URL(window.location.href)
      url.searchParams.delete(key as string)
      window.history.replaceState({}, '', url.toString())
    } else {
      data.delete(key)
    }
    if (_option.onChange) {
      _option.onChange(key as string, undefined, 'delete')
    }
    changes.set(key as string, true)
    dispatch()
  }

  const clear = () => {
    for (let key in initial) {
      _delete(key as keyof IT)
      changes.set(key, true)
    }
    dispatch()
  }

  const getState = () => {
    let d: any = {}
    for (let key in initial) {
      d[key] = get(key)
    }
    return d as IT
  }

  const setState = (state: Partial<IT>) => {
    for (let key in state) {
      if (!(key in initial)) throw new Error(`(${key}) Invalid key provided in the setState function. Please verify the structure of the initial state data.`)
      set(key as keyof IT, state[key] as IT[typeof key])
      changes.set(key, true)
    }
    dispatch()
  }

  const isChange = <T extends keyof IT>(key: T) => changes.get(key as string) || false
  const clearChange = <T extends keyof IT>(key: T) => changes.set(key as string, false)
  const getChanges = () => Array.from(changes.keys()).filter((key: string) => clearChange(key))
  const clearChanges = () => Array.from(changes.keys()).forEach((key: string) => changes.set(key, false))

  for (let key in initial) {
    set(key as keyof IT, initial[key])
  }

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
      clearChange,
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
  useHook.clearChange = clearChange
  useHook.clearChanges = clearChanges

  return useHook
}