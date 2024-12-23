import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createBucket } from './src'


const useForm = createBucket({
  name: "Initla"
}, { store: "url" })


const Change = () => {
  const form = useForm()

  return (
    <button
      onClick={() => {
        form.set("name", "nax")
      }}
    >Add</button>
  )
}

const Delete = () => {
  const form = useForm()

  return (
    <button
      onClick={() => {
        form.delete("name")
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
      <Delete />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
