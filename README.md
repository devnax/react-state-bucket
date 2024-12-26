<p align="center">
  <a href="https://mui.com/core/" rel="noopener" target="_blank"><img width="120" src="https://api.mypiebd.com/uploads/2024/11/26/images/5c31a5fc731a89c82fd0e846dd69a99378243.png" alt="Material UI logo"></a>
</p>

<h1 align="center">React State Bucket</h1>


`react-state-bucket` is a lightweight and powerful package designed to manage states globally in React applications. It provides CRUD operations for your state data with ease, enabling developers to handle complex state management scenarios without the need for heavy libraries.

This package supports multiple storage options, including:

- Memory (default)
- Session Storage
- Local Storage
- URL Query Parameters

## Installation

```bash
npm install react-state-bucket
```

## Features

- **Global State Management**: Easily manage state across your entire React application.
- **CRUD Operations**: Create, Read, Update, and Delete state values effortlessly.
- **Multiple Storage Options**: Choose where to store your data ("memory", "session", "local", or "url").
- **Reactivity**: Automatically update components when the state changes.
- **Custom Hooks**: Seamlessly integrate with React’s functional components.

## Usage

### Basic Example

```jsx
"use client";

import React from "react";
import createBucket from "react-state-bucket";

// Create a bucket with initial state
const useGlobalState = createBucket({ count: 0, user: "Guest" });

function App() {
    const globalState = useGlobalState();

    return (
        <div>
            <h1>Global State Management</h1>
            <p>Count: {globalState.get("count")}</p>
            <button onClick={() => globalState.set("count", globalState.get("count") + 1)}>Increment</button>
            <button onClick={() => globalState.delete("count")}>Reset Count</button>
            <pre>{JSON.stringify(globalState.getState(), null, 2)}</pre>
        </div>
    );
}

export default App;
```

### Using Multiple Buckets

```jsx
const useUserBucket = createBucket({ name: "", age: 0 });
const useSettingsBucket = createBucket({ theme: "light", notifications: true });

function Profile() {
    const userBucket = useUserBucket();
    const settingsBucket = useSettingsBucket();

    return (
        <div>
            <h1>User Profile</h1>
            <button onClick={() => userBucket.set("name", "John Doe")}>Set Name</button>
            <button onClick={() => settingsBucket.set("theme", "dark")}>Change Theme</button>
            <pre>User State: {JSON.stringify(userBucket.getState(), null, 2)}</pre>
            <p>Current Theme: {settingsBucket.get("theme")}</p>
        </div>
    );
}
```

### Storage Options Example

```jsx
const usePersistentBucket = createBucket(
    { token: "", language: "en" },
    { store: "local" }
);

function PersistentExample() {
    const persistentBucket = usePersistentBucket();

    return (
        <div>
            <h1>Persistent Bucket</h1>
            <button onClick={() => persistentBucket.set("token", "abc123")}>Set Token</button>
            <p>Token: {persistentBucket.get("token")}</p>
        </div>
    );
}
```

### Reusing State Across Components

```jsx
"use client";

import React from "react";
import createBucket from "react-state-bucket";

// Create a global bucket
const useGlobalState = createBucket({ count: 0, user: "Guest" });

function Counter() {
    const globalState = useGlobalState(); // Access bucket functions and trigger re-render on state updates

    return (
        <div>
            <h2>Counter Component</h2>
            <p>Count: {globalState.get("count")}</p>
            <button onClick={() => globalState.set("count", globalState.get("count") + 1)}>
                Increment Count
            </button>
        </div>
    );
}

function UserDisplay() {
    const globalState = useGlobalState(); // Reuse the same global bucket for reactivity

    return (
        <div>
            <h2>User Component</h2>
            <p>Current User: {globalState.get("user")}</p>
            <button onClick={() => globalState.set("user", "John Doe")}>
                Set User to John Doe
            </button>
        </div>
    );
}

function App() {

    return (
        <div>
            <h1>Global State Example</h1>
            <Counter />
            <UserDisplay />
            <pre>Global State: {JSON.stringify(useGlobalState().getState(), null, 2)}</pre>
        </div>
    );
}

export default App;
```

## Direct Usage of Functions

The `createBucket` function provides direct access to the state management methods like `get`, `set`, `delete`, and others. For components that require re-rendering when the state changes, call the custom hook returned by `createBucket` within the component.

### Example

```jsx
const useGlobalState = createBucket({ count: 0, user: "Guest" });

function Counter() {

    return (
        <div>
            <p>Count: {useGlobalState.get("count")}</p>
            <button onClick={() => useGlobalState.set("count", useGlobalState.get("count") + 1)}>Increment</button>
        </div>
    );
}

function App() {
    useGlobalState(); // Will automatically re-render when state updates

    return (
        <div>
            <Counter />
        </div>
    );
}

export default App;
```



## API Reference

### `createBucket(initial: object, option?: BucketOptions)`

Creates a new bucket for managing the global state.

#### Parameters

| Name      | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| `initial` | `object`  | Initial state values.                     |
| `option`  | `object?` | Optional configuration (default: memory). |

#### `BucketOptions`

`BucketOptions` allows you to configure how and where the state is stored. It includes:

| Property | Type                                  | Description                                    |
| -------- | ------------------------------------- | ---------------------------------------------- |
| `store`  | `'memory', 'session', 'local', 'url'` | Specifies the storage mechanism for the state. |

### Returned Functions

#### State Management

| Function          | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `set(key, value)` | Sets the value of a specific key in the state.        |
| `get(key)`        | Retrieves the value of a specific key from the state. |
| `delete(key)`     | Removes a key-value pair from the state.              |
| `clear()`         | Clears all state values.                              |
| `getState()`      | Returns the entire state as an object.                |
| `setState(state)` | Updates the state with a partial object.              |

#### Change Detection

| Function         | Description                                 |
| ---------------- | ------------------------------------------- |
| `isChange(key)`  | Checks if a specific key has been modified. |
| `getChanges()`   | Returns an array of keys that have changed. |
| `clearChanges()` | Resets the change detection for all keys.   |

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

