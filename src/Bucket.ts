import { Infer, XVInstanceType } from "xanv"
export type StoreType = "memory" | "session" | "local" | "url" | "cookie"

export type InitialBucketData = {
   [key: string]: XVInstanceType
}

export type BucketOptions = {
   store?: StoreType;
   onChange?: (key: string, value: any) => void
}

class Bucket<IT extends InitialBucketData> {
   private initial: IT
   private option: BucketOptions
   private hooks: Map<string, Function> = new Map()
   private data: Map<keyof IT, IT[keyof IT]> = new Map()
   readonly changes: Map<keyof IT, boolean> = new Map()

   constructor(initial: IT, option?: BucketOptions) {
      this.initial = initial
      this.option = { store: "memory", ...option }
   }

   subscribe(id: string, hook: Function) {
      if (!id.startsWith("rsb_")) throw new Error("Invalid subscription")
      this.hooks.set(id, hook)
   }

   unsubscribe(id: string) {
      this.hooks.delete(id)
   }

   set<T extends keyof IT>(key: T, value: Infer<IT[T]>, dispatch = true) {
      if (typeof window !== 'undefined') {
         value = JSON.stringify(value) as any
         if (this.option.store === 'session' || this.option.store === 'local') {
            let storage = this.option.store === "session" ? sessionStorage : localStorage
            storage.setItem(key as string, value)
         } else if (this.option.store === 'url') {
            let url = new URL(window.location.href)
            url.searchParams.set(key as string, encodeURIComponent(value))
            window.history.replaceState({}, '', url.toString())
         } else if (this.option.store === 'cookie') {
            document.cookie = `${key as string}=${encodeURIComponent(value)}; path=/`
         } else {
            this.data.set(key as any, value)
         }

         this.changes.set(key as string, true)
         if (this.option.onChange) {
            this.option.onChange(key as string, value)
         }

         if (dispatch) {
            this.hooks.forEach(h => h())
         }
      }
   }

   get<T extends keyof IT>(key: T) {
      if (typeof window !== 'undefined') {
         let value;
         if (this.option.store === 'session' || this.option.store === 'local') {
            let storage = this.option.store === "session" ? sessionStorage : localStorage
            value = storage.getItem(key as string)!
         } else if (this.option.store === 'url') {
            let url = new URL(window.location.href)
            let storedValue = url.searchParams.get(key as string)!
            value = decodeURIComponent(storedValue)
         } else if (this.option.store === 'cookie') {
            let match = document.cookie.match(new RegExp('(^| )' + (key as string) + '=([^;]+)'))
            if (match) {
               value = decodeURIComponent(match[2])
            }
         } else {
            value = this.data.get(key as any)
         }

         try {
            value = JSON.parse(value as any)
         } catch (error) { }

         try {
            value = this.initial[key].parse(value)
         } catch (error) {
         }
         return value

      }
   }

   sets(state: { [key in keyof IT]?: Infer<IT[key]> }) {
      for (let k in state) {
         this.set(k as keyof IT, state[k as keyof IT]!, true)
      }
      this.hooks.forEach(h => h())
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
            // console.log(k, this.get(k as keyof IT));

            this.initial[k].parse(this.get(k as keyof IT))
         } catch (error: any) {
            errors.set(k, error.message)
         }
      }
      return errors
   }

}

export default Bucket