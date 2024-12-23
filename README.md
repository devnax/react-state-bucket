# React State Bucket

`react-state-bucket` is a lightweight state management library for React. It allows developers to create global states that can be accessed and modified from any component. The state can be stored in memory, session storage, or the URL query parameters, providing flexibility for different use cases.

## Features

- Lightweight and easy-to-use global state management.
- Supports three storage options: memory, session storage, and URL.
- Fully TypeScript-supported API.
- React hook-based implementation for seamless integration.
- Ideal for both small and large-scale React applications.

## Installation

Install the package via npm or yarn:

```bash
npm install react-state-bucket
```

or

```bash
yarn add react-state-bucket
```

## Usage

### Importing the Package

The package is designed for use with React's client-side components. Start by importing the required functionality:

```javascript
"use client";
import { createBucket } from "react-state-bucket";
```

### Creating a State

Use the `createBucket` function to define a global state. Provide an initial state object and optionally specify the storage type (`"memory"`, `"session"`, or `"url"`).

```javascript
const useGlobalState = createBucket({
  count: 0,
  name: "React",
}, {
  store: "memory", // Optional: Defaults to "memory"
});
```

### Using the State in Components

Components can access and manipulate the state by calling the `useGlobalState` hook.

#### Example:

```javascript
import React from "react";

function Counter() {
  const state = useGlobalState();

  return (
    <div>
      <h1>Count: {state.get("count")}</h1>
      <button onClick={() => state.set("count", state.get("count") + 1)}>
        Increment
      </button>
      <button onClick={() => state.delete("count")}>Reset</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Counter />
    </div>
  );
}

export default App;
```

### State API

When you call the hook returned by `createBucket`, you gain access to a set of utility methods:

| Method            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `set(key, value)` | Sets the value of a specific key in the state.             |
| `get(key)`        | Gets the value of a specific key from the state.           |
| `delete(key)`     | Deletes a specific key from the state.                     |
| `clear()`         | Clears all keys from the state.                            |
| `getState()`      | Retrieves the entire state object.                         |
| `setState(state)` | Updates the state with a partial object.                   |
| `isChange(key)`   | Checks if a specific key has changed since the last clear. |
| `getChanges()`    | Retrieves an object representing all changed keys.         |
| `clearChanges()`  | Clears the record of changes.                              |

### Storage Options

The `createBucket` function supports three storage types:

1. **Memory (default):** Stores the state in memory for the duration of the session.
2. **Session:** Persists the state in `sessionStorage` across page reloads.
3. **URL:** Stores the state in the URL's query parameters, enabling sharable states.

#### Example with URL Storage:

```javascript
const useURLState = createBucket({
  theme: "light",
}, {
  store: "url",
});

function ThemeSwitcher() {
  const state = useURLState();

  return (
    <button onClick={() => state.set("theme", state.get("theme") === "light" ? "dark" : "light")}>
      Toggle Theme (Current: {state.get("theme")})
    </button>
  );
}
```

## Real-World Example

### Managing a Multi-Step Form

```javascript
const useFormState = createBucket({
  step: 1,
  formData: {},
});

function MultiStepForm() {
  const state = useFormState();

  const nextStep = () => state.set("step", state.get("step") + 1);
  const prevStep = () => state.set("step", state.get("step") - 1);

  return (
    <div>
      <h2>Step {state.get("step")}</h2>
      <button onClick={prevStep} disabled={state.get("step") === 1}>Back</button>
      <button onClick={nextStep}>Next</button>
    </div>
  );
}
```

## Best Practices

- Use `memory` storage for temporary UI states that don't need persistence.
- Use `session` storage for states that should persist across page reloads but not sessions.
- Use `url` storage for sharable states, like filters or query parameters.

## FAQs

### 1. Can I use `react-state-bucket` in a server-side rendered (SSR) application?
Currently, `react-state-bucket` is designed for client-side use only.

### 2. What happens if I try to set an undefined key?
An error will be thrown, ensuring state integrity.

### 3. Can I use this package with TypeScript?
Yes, `react-state-bucket` fully supports TypeScript with type-safe APIs.

## GitHub Repository

Find the source code and contribute to the project on GitHub:
[https://github.com/devnax/react-state-bucket.git](https://github.com/devnax/react-state-bucket.git)

[![npm version](https://img.shields.io/npm/v/react-state-bucket.svg)](https://www.npmjs.com/package/react-state-bucket)

## License

MIT