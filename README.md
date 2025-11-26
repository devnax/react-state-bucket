<p align="center">
  <img width="120" src="https://raw.githubusercontent.com/devnax/react-state-bucket/main/logo.png" alt="React State Bucket logo">
</p>

<h1 align="center">React State Bucket</h1>

Effortlessly manage React application states with **react-state-bucket**, a lightweight yet powerful state management library.

---

## 🚀 Features

- **Global State Management**: Manage state across your entire React application with ease.
- **CRUD Operations**: Create, Read, Update, and Delete state values effortlessly.
- **Multiple Storage Options**: Store state in "memory," "session storage," "local storage," or "URL parameters."
- **Reactivity**: Automatically update components when the state changes.
- **Custom Hooks**: Seamlessly integrate with React’s functional components.
- **TypeScript Support**: Fully typed for a better development experience.
- **Lightweight**: Small bundle size with no unnecessary dependencies.
- **Change Callbacks**: React to every `set` or `delete` via the optional `onChange` hook.

---

## 📦 Installation

Install the package via npm or yarn:

```bash
# Using npm
npm install react-state-bucket

# Using yarn
yarn add react-state-bucket
```

---

## 🔧 Setup and Usage

### Step 1: Create a State Bucket

Define your initial state and actions:

```javascript
import { createBucket } from 'react-state-bucket';

const initialState = {
  count: 0,
  user: 'Guest',
};

export const useGlobalState = createBucket(initialState);
```

### Step 2: Use the State Bucket in a Component

Access state and actions in your React components:

```javascript
import React from 'react';
import { useGlobalState } from './state';

const App = () => {
  const globalState = useGlobalState();

  return (
    <div>
      <h1>Global State Management</h1>
      <p>Count: {globalState.get('count')}</p>
      <button onClick={() => globalState.set('count', globalState.get('count') + 1)}>Increment</button>
      <button onClick={() => globalState.delete('count')}>Reset Count</button>
      <pre>{JSON.stringify(globalState.getState(), null, 2)}</pre>
    </div>
  );
};

export default App;
```

---

## 🌟 Advanced Features

### Using Multiple Buckets

```javascript
const useUserBucket = createBucket({ name: '', age: 0 });
const useSettingsBucket = createBucket({ theme: 'light', notifications: true });

function Profile() {
  const userBucket = useUserBucket();
  const settingsBucket = useSettingsBucket();

  return (
    <div>
      <h1>User Profile</h1>
      <button onClick={() => userBucket.set('name', 'John Doe')}>Set Name</button>
      <button onClick={() => settingsBucket.set('theme', 'dark')}>Change Theme</button>
      <pre>User State: {JSON.stringify(userBucket.getState(), null, 2)}</pre>
      <p>Current Theme: {settingsBucket.get('theme')}</p>
    </div>
  );
}
```

### Persistent Storage Options

```javascript
const usePersistentBucket = createBucket(
  { token: '', language: 'en' },
  { store: 'local' }
);

function PersistentExample() {
  const persistentBucket = usePersistentBucket();

  return (
    <div>
      <h1>Persistent Bucket</h1>
      <button onClick={() => persistentBucket.set('token', 'abc123')}>Set Token</button>
      <p>Token: {persistentBucket.get('token')}</p>
    </div>
  );
}
```

### Reusing State Across Components

```javascript
import React from 'react';
import { createBucket } from 'react-state-bucket';

const useGlobalState = createBucket({ count: 0, user: 'Guest' });

function Counter() {
  const globalState = useGlobalState();

  return (
    <div>
      <h2>Counter Component</h2>
      <p>Count: {globalState.get('count')}</p>
      <button onClick={() => globalState.set('count', globalState.get('count') + 1)}>Increment Count</button>
    </div>
  );
}

function UserDisplay() {
  const globalState = useGlobalState();

  return (
    <div>
      <h2>User Component</h2>
      <p>Current User: {globalState.get('user')}</p>
      <button onClick={() => globalState.set('user', 'John Doe')}>Set User to John Doe</button>
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

---

## 📘 API Reference

### `createBucket(initial: object, option?: BucketOptions)`

Creates a new bucket for managing the global state.

#### Parameters

| Name      | Type      | Description                               |
| --------- | --------- | ----------------------------------------- |
| `initial` | `object`  | Initial state values.                     |
| `option`  | `object?` | Optional configuration (default: memory). |

#### `BucketOptions`

`BucketOptions` allows you to configure how and where the state is stored. It includes:

| Property   | Type                                  | Description                                                                  |
| ---------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| `store`    | `'memory', 'session', 'local', 'url'` | Specifies the storage mechanism for the state.                               |
| `onChange` | `(key, value, type) => void`          | Callback invoked after each `set`/`delete`. `type` is `'set'` or `'delete'`. |

#### `onChange` Callback

Use `onChange` to observe bucket mutations—for example, to sync analytics or trigger side effects.

```javascript
const useBucketWithLogger = createBucket(
  { count: 0 },
  {
    onChange: (key, value, type) => {
      console.log(`[bucket] ${type} -> ${key}`, value);
    },
  }
);
```

When `set('count', 1)` runs, the callback fires with `(key='count', value=1, type='set')`. Deletions invoke the same hook with `type='delete'` and `value` as `undefined`.

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

---

## 🤝 Contributing

Contributions are welcome! Please check out the [contribution guidelines](https://github.com/devnax/react-state-bucket).

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 📞 Support

For help or suggestions, feel free to open an issue on [GitHub](https://github.com/devnax/react-state-bucket/issues) or contact us via [devnaxrul@gmail.com](mailto:devnaxrul@gmail.com).

