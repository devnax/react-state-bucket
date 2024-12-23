"use client"
import { useEffect, useId, useState } from "react"

type Option = {
    store?: "memory" | "session" | "url"
}

export const createBucket = <IT extends { [key: string]: any }>(initial: IT, option?: Option) => {
    const hooks = new Map<string, Function>()
    let data = new Map<any, any>()
    let changes = new Map<string, boolean>()

    let _option: Option = {
        store: "memory",
        ...option,
    }
    const handleStorage = (isLoaded = true) => {
        if (typeof window !== 'undefined') {
            let url = new URL(window.location.href)
            if (_option.store === 'session') {
                for (let key in initial) {
                    let has = sessionStorage.getItem(key) !== null
                    if (isLoaded || !has) {
                        if (data.has(key)) {
                            sessionStorage.setItem(key, data.get(key))
                        } else {
                            sessionStorage.removeItem(key)
                        }
                    } else if (has) {
                        data.set(key, sessionStorage.getItem(key))
                    }
                }
            } else if (_option.store === "url") {
                for (let key in initial) {
                    let has = url.searchParams.has(key)
                    if (isLoaded || !has) {
                        if (data.has(key)) {
                            url.searchParams.set(key, data.get(key))
                        } else {
                            url.searchParams.delete(key)
                        }
                    } else if (has) {
                        data.set(key, url.searchParams.get(key))
                    }
                }
                window.history.replaceState(null, '', url.toString())
            }
        }
    }

    for (let key in initial) {
        let value = initial[key]
        data.set(key, value)
        changes.set(key, true)
    }
    handleStorage(false)

    let dispatch = () => {
        hooks.forEach(d => {
            try {
                d()
            } catch (error) { }
        })
    }

    const useHook = () => {
        const id = useId()
        const [, setUp] = useState(0)

        useEffect(() => {
            hooks.set(id, () => setUp(Math.random()))
            return () => {
                hooks.delete(id)
            }
        }, [])

        return {
            set: <T extends keyof IT>(key: T, value: IT[T]) => {
                if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the set function. Please verify the structure of the initial state data.`)
                data.set(key, value)
                changes.set(key as string, true)
                dispatch()
                handleStorage()
            },
            get: <T extends keyof IT>(key: T): IT[T] => {
                return data.get(key)
            },
            delete: <T extends keyof IT>(key: T) => {
                data.delete(key)
                changes.set(key as string, true)
                dispatch()
                handleStorage()
            },
            clear: () => {
                for (let key in initial) {
                    data.delete(key)
                    changes.set(key, true)
                }
                dispatch()
                handleStorage()
            },
            getState: () => {
                let d: any = {}
                for (let key in initial) {
                    d[key] = data.get(key)
                }
                return d as IT
            },
            setState: (state: Partial<IT>) => {
                for (let key in state) {
                    if (!(key in initial)) throw new Error(`(${key}) Invalid key provided in the setState function. Please verify the structure of the initial state data.`)
                    data.set(key, state[key] as any)
                    changes.set(key, true)
                }
                dispatch()
                handleStorage()
            },

            isChange: <T extends keyof IT>(key: T) => Boolean(changes.get(key as string)),
            getChanges: () => {
                let _changes: any = {}
                for (let key of changes.keys()) {
                    if (changes.get(key as string)) _changes[key] = true
                }
                return _changes as { [key in keyof IT]: boolean }
            },
            clearChanges: () => {
                for (let key of changes.keys()) {
                    changes.set(key, false)
                }
            }
        }
    }

    return useHook
}

