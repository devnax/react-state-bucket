import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBucket } from './src'

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

  return (
    <div>
      name: {name}
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Change />
      <Delete />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
