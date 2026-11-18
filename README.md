# react-state-bucket

Lightweight global state for React with built-in validation schemas, change tracking, and optional persistence.

## Installation

```bash
npm install react-state-bucket
```

## Core idea

You define a bucket once with schema fields (from `xv`) and then use the returned store object across components.

```ts
import { createBucket, xv } from "react-state-bucket";

export const formStore = createBucket(
  {
    email: xv.string().email().default(""),
    password: xv.string().default(""),
    loading: xv.boolean().default(false),
  },
  { store: "local" }
);
```

Then read and write state anywhere:

```tsx
import { formStore } from "./state";

export function LoginForm() {
  const email = formStore.get("email", "");

  return (
    <>
      <input
        value={email}
        onChange={(e) => formStore.set("email", e.target.value)}
      />

      <button onClick={() => formStore.set("loading", true)}>
        Submit
      </button>

      <pre>{JSON.stringify(formStore.state(), null, 2)}</pre>
    </>
  );
}
```

## API

### `createBucket(initial, options?)`

- `initial`: object where each key is an `xv` schema instance.
- `options`: optional configuration.

Returns a shared store object with state and mutation/validation methods.

### `xv`

`xv` is re-exported from the package so you can define typed/validated fields directly:

```ts
import { xv } from "react-state-bucket";

const schema = {
  name: xv.string().default("Guest"),
  age: xv.number().min(0).default(0),
};
```

### `BucketOptions`

```ts
type StoreType = "memory" | "session" | "local" | "url" | "cookie";

type BucketOptions = {
  store?: StoreType;
  data_key?: string;
  onChange?: (key: string, value: any) => void;
};
```

- `store`: persistence target (default: `"memory"`).
- `data_key`: custom persistence key. If omitted, one is generated from your schema meta.
- `onChange`: runs after each `set` (and `delete`, because `delete` uses `set(key, undefined)`).

## Methods returned by `createBucket`

The returned store exposes:

- `state(dispatch?)`: returns the full shared state object.
- `get(key, defaultValue?, dispatch?)`: read one value.
- `set(key, value, dispatch?)`: update one field.
- `sets(partial, dispatch?)`: update multiple fields.
- `delete(key)`: sets the field to `undefined`.
- `clear()`: reset to initialized values.
- `getChanges(dispatch?)`: returns changed key/value pairs.
- `isChanged(key, dispatch?)`: whether a key was changed.
- `validate()`: validate all fields with schema `parse`.
- `isValid(key, dispatch?)`: validate one field.
- `getErrors(dispatch?)`: all current validation/custom errors.
- `getError(key, dispatch?)`: one error message or empty string.
- `setError(key, message)`: set custom error.
- `clearError(key)`: remove one error.
- `clearErrors()`: remove all errors.

`dispatch` defaults to `true` in read/helper methods and enables re-render sync in React usage.

## Persistence modes

- `memory`: in-memory only.
- `session`: uses `sessionStorage`.
- `local`: uses `localStorage`.
- `url`: stores serialized state in a query param.
- `cookie`: stores serialized state in a cookie.

Example:

```ts
const prefsStore = createBucket(
  {
    theme: xv.string().default("light"),
    language: xv.string().default("en"),
  },
  {
    store: "cookie",
    onChange: (key, value) => {
      console.log("changed", key, value);
    },
  }
);
```

## React usage notes

- This package is intended for React function components.
- In React/Next apps, call `store.get(...)` (or `store.state()`) inside render so updates trigger re-renders.
- Files use browser APIs (`localStorage`, `sessionStorage`, URL, `document.cookie`) for non-memory stores.

## Notes

- Accessing keys not defined in your initial schema throws an error.
- For server-only environments, use `store: "memory"`.

## License

MIT

