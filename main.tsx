import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBucket, xv } from './src';

const store = createBucket({
  email: xv.string().email().default("devnax@gmail.com").optional(),
  password: xv.string().default("nax"),
  loading: xv.boolean().default(false),
}, { store: "local" });

const Change = () => {

  return (
    <button
      onClick={() => {
        store.set("email", "Hello")
      }}
    >Add</button>
  )
}

const Delete = () => {

  return (
    <button
      onClick={() => {
        store.set("email", "Nice to meet you")
      }}
    >Delete</button>
  )
}

const App = () => {
  const email = store.get("email")

  return (
    <div>
      email: {email}
      <Change />
      <Delete />
    </div>
  );
};

const rootEle = document.getElementById('root')
if (rootEle) {
  const root = createRoot(rootEle);
  root.render(<App />);
}
