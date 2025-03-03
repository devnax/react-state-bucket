import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBucket } from './pack';

const useForm = createBucket({
  name: ""
}, { store: "url" })

const Change = () => {

  return (
    <button
      onClick={() => {
        useForm.set("name", useForm.get("name") === "nax" ? "Devnax" : "nax")
      }}
    >Add</button>
  )
}

const Delete = () => {
  return (
    <button
      onClick={() => {
        useForm.delete("name")
      }}
    >Delete</button>
  )
}

const App = () => {
  const form = useForm()
  const name = form.get("name")
  console.log(form.getChanges());

  return (
    <div>
      name: {name}
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
