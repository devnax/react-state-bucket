import { useEffect, useId, useState } from "react"
import { xv as XV } from "xanv"
import Bucket, { BucketOptions, InitialBucketData } from "./Bucket"

export const createBucket = <IT extends InitialBucketData>(initial: IT, option?: BucketOptions) => {
  const bucket = new Bucket(initial, option)
  const useBucket = () => {
    const id = "rsb_" + useId()
    const [, setState] = useState(0)

    useEffect(() => {
      bucket.subscribe(id, () => setState(Math.random()))
      return () => {
        bucket.unsubscribe(id)
      }
    }, [id])

    return bucket
  }
  return useBucket
}

export const xv = XV