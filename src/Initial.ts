import { BucketOptions, InitialBucketData } from ".";
import { getCookie } from "./Cookie";

const Initial = (initial: InitialBucketData, data_key: string, option: BucketOptions) => {
   let state = {} as Record<string, any>;
   let data: any = ""

   if (typeof window !== 'undefined') {
      if (option.store === 'session' || option.store === 'local') {
         let storage = option.store === "session" ? sessionStorage : localStorage
         data = storage.getItem(data_key)
      } else if (option.store === 'url') {
         let url = new URL(window.location.href)
         data = decodeURIComponent(url.searchParams.get(data_key) || "")
      } else if (option.store === 'cookie') {
         data = getCookie(data_key)
      }
   }

   if (data) {
      try {
         data = JSON.parse(data)
      } catch (error) {
         data = {}
      }
   } else {
      data = {}
   }

   for (let key in initial) {
      try {
         state[key] = initial[key].parse(data[key])
      } catch (error) {
         state[key] = data[key]
      }
   }

   return state;
}

export default Initial;