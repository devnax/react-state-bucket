import { Infer, XVInstanceType } from "xanv"
import { getCookie, setCookie } from "./Cookie"
import youid from "youid"
export type StoreType = "memory" | "session" | "local" | "url" | "cookie"

export type InitialBucketData = {
   [key: string]: XVInstanceType
}

export type BucketOptions = {
   store?: StoreType;
   data_key?: string;
   onChange?: (key: string, value: any) => void
}


class Bucket<IT extends InitialBucketData> {
   private initial: IT
   private option: BucketOptions
   private hooks: Map<string, Function> = new Map()
   private data: Record<any, any> = {}
   readonly changes: Map<keyof IT, boolean> = new Map()
   private data_key: string

   constructor(initial: IT, option?: BucketOptions) {
      this.initial = initial
      this.option = { store: "memory", ...option }
      this.data_key = option?.data_key || ''
      if (!this.data_key) {
         let data_key = ''
         for (let key in initial) {
            const field = initial[key]
            data_key += key + ':' + JSON.stringify(field.meta) + ';'
         }
         this.data_key = youid(data_key)
      }


      if (typeof window !== 'undefined') {
         if (this.option.store === 'session' || this.option.store === 'local') {
            let storage = this.option.store === "session" ? sessionStorage : localStorage
            const value = storage.getItem(this.data_key)
            let data: any = {}
            if (value) {
               data = JSON.parse(value)
            }
            for (let key in initial) {
               try {
                  this.data[key] = initial[key].parse(data[key])
               } catch (error) {
                  this.data[key] = data[key]
               }
            }
         } else if (this.option.store === 'url') {
            let url = new URL(window.location.href)
            const value = url.searchParams.get(this.data_key)
            let data: any = {}
            if (value) {
               data = JSON.parse(decodeURIComponent(value))
            }
            for (let key in initial) {
               try {
                  this.data[key] = initial[key].parse(data[key])
               } catch (error) {
                  this.data[key] = data[key]
               }
            }
         } else if (this.option.store === 'cookie') {
            const cookieData = getCookie(this.data_key)
            let data: any = {}
            if (cookieData) {
               data = JSON.parse(cookieData)
            }
            for (let key in initial) {
               try {
                  this.data[key] = initial[key].parse(data[key])
               } catch (error) {
                  this.data[key] = data[key]
               }
            }
         } else {
            for (let key in initial) {
               try {
                  this.data[key] = initial[key].parse(undefined)
               } catch (error) {
               }
            }
         }
      } else {
         for (let key in initial) {
            try {
               this.data[key] = initial[key].parse(undefined)
            } catch (error) {
            }
         }
      }
   }

   subscribe(id: string, hook: Function) {
      if (!id.startsWith("rsb_")) throw new Error("Invalid subscription")
      this.hooks.set(id, hook)
   }

   unsubscribe(id: string) {
      this.hooks.delete(id)
   }

   set<T extends keyof IT>(key: T, value: Infer<IT[T]>, dispatch = true) {
      if (!(key in this.initial)) {
         throw new Error(`Key ${String(key)} not in Bucket initial data`)
      }
      this.data[key] = value
      this.changes.set(key as string, true)
      if (this.option.onChange) {
         this.option.onChange(key as string, value)
      }

      if (typeof window !== 'undefined') {
         value = JSON.stringify(value) as any
         if (this.option.store === 'session' || this.option.store === 'local') {
            let storage = this.option.store === "session" ? sessionStorage : localStorage
            storage.setItem(this.data_key, JSON.stringify(this.data))
         } else if (this.option.store === 'url') {
            let url = new URL(window.location.href)
            url.searchParams.set(this.data_key, encodeURIComponent(JSON.stringify(this.data)))
            window.history.replaceState({}, '', url.toString())
         } else if (this.option.store === 'cookie') {
            setCookie(this.data_key, JSON.stringify(this.data))
         }
      }

      if (dispatch) {
         this.hooks.forEach(h => h())
      }
   }

   get<T extends keyof IT>(key: T) {
      if (!(key in this.initial)) {
         throw new Error(`Key ${String(key)} not in Bucket initial data`)
      }
      return this.data[key]
   }

   sets(state: { [key in keyof IT]?: Infer<IT[key]> }) {
      for (let k in state) {
         this.set(k as keyof IT, state[k as keyof IT]!, true)
      }
      this.hooks.forEach(h => h())
   }

   validate() {
      try {
         for (let k in this.initial) {
            this.initial[k].parse(this.get(k as keyof IT))
         }
      } catch (error) {
         return false
      }
      return true
   }

   get state() {
      const state: { [key in keyof IT]: Infer<IT[key]> } = {} as any
      for (let k in this.initial) {
         state[k] = this.get(k as keyof IT)
      }
      return state
   }

   get errors() {
      const errors = new Map<keyof IT, string>()
      for (let k in this.initial) {
         try {
            this.initial[k].parse(this.get(k as keyof IT))
         } catch (error: any) {
            errors.set(k, error.message)
         }
      }
      return errors
   }

}

export default Bucket