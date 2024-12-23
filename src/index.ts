"use client"
import { useEffect, useId, useState } from "react"

type Option = {
    store: "memory" | "session" | "url"
}

export const createBucket = <IT extends { [key: string]: any }>(initial: IT, option?: Option) => {
    const hooks = new Map<string, Function>()
    let data = new Map<any, any>()
    let changes = new Map<string, boolean>()
    const isWin = typeof window !== 'undefined'
    let url = new URL(isWin ? window.location.href : "");

    let _option: Option = {
        store: "memory",
        ...option,
    }

    const setIntial = () => {
        for (let key in initial) {
            let value = initial[key]
            switch (_option.store) {
                case "memory":
                    data.set(key, value)
                    break;
                case "session":
                    if (!sessionStorage.getItem(key)) {
                        sessionStorage.setItem(key as string, value)
                    }
                    break;
                case "url":
                    if (!url.searchParams.has(key)) {
                        url.searchParams.set(key as string, value)
                        isWin && window.history.replaceState(null, '', url.toString())
                    }
                    break;
            }
            changes.set(key, true)
        }
    }

    setIntial()

    const useHook = () => {
        const id = useId()
        const [, up] = useState(0)

        useEffect(() => {
            hooks.set(id, () => up(Math.random()))
            return () => {
                hooks.delete(id)
            }
        }, [])

        const root = {
            set: <T extends keyof IT>(key: T, value: IT[T]) => {
                if (!(key in initial)) throw new Error(`(${key as string}) Invalid key provided in the set function. Please verify the structure of the initial state data.`)
                switch (_option.store) {
                    case "memory":
                        data.set(key, value)
                        break;
                    case "session":
                        isWin && sessionStorage.setItem(key as string, value)
                        break;
                    case "url":
                        url.searchParams.set(key as string, value);
                        isWin && window.history.replaceState(null, '', url.toString());
                        break;
                }
                changes.set(key as string, true)
                hooks.forEach(d => d())

            },
            get: <T extends keyof IT>(key: T): IT[T] => {
                switch (_option.store) {
                    case "memory":
                        return data.get(key)
                    case "session":
                        return isWin ? sessionStorage.getItem(key as string) as any : initial[key]
                    case "url":
                        return isWin ? url.searchParams.get(key as string) as any : initial[key]
                }
            },
            delete: <T extends keyof IT>(key: T) => {
                switch (_option.store) {
                    case "memory":
                        data.delete(key)
                        break;
                    case "session":
                        isWin && sessionStorage.removeItem(key as string)
                        break;
                    case "url":
                        url.searchParams.delete(key as string);
                        isWin && window.history.replaceState(null, '', url.toString());
                        break;
                }
                changes.set(key as string, true)
                hooks.forEach(d => d())
            },
            clear: () => {
                for (let key in initial) {
                    root.delete(key)
                    changes.set(key, true)
                }
                hooks.forEach(d => d())
            },
            getState: () => {
                let d: any = {}
                for (let key of data.keys()) {
                    d[key] = root.get(key)
                }
                return d as IT
            },
            setState: (state: Partial<IT>) => {
                for (let key in state) {
                    if (!(key in initial)) throw new Error(`(${key}) Invalid key provided in the setState function. Please verify the structure of the initial state data.`)
                    root.set(key, state[key] as any)
                    changes.set(key, true)
                }
                hooks.forEach(d => d())
            },

            isChange: <T extends keyof IT>(key: T) => Boolean(changes.get(key as string)),
            getChanges: () => {
                let _changes: any = {}
                for (let key of changes.keys()) {
                    const is = changes.get(key as string)
                    if (is) {
                        _changes[key] = true
                    }
                }
                return _changes as { [key in keyof IT]: boolean }
            },
            clearChanges: () => {
                for (let key of changes.keys()) {
                    changes.set(key, false)
                }
            }
        }

        return root
    }

    return useHook
}

