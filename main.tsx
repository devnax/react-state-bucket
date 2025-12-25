import { createRoot } from 'react-dom/client';
import { createBucket, xv } from './src';

const useForm = createBucket({
  email: xv.string().email().default("devnax@gmail.com").optional(),
  password: xv.string().default("nax"),
  loading: xv.boolean().default(false),
}, { store: 'local' });

const Change = () => {
  const form = useForm()
  return (
    <button
      onClick={() => {
        form.set("email", "devnax")
      }}
    >Add</button>
  )
}

const Delete = () => {
  const form = useForm()
  return (
    <button
      onClick={() => {
        form.set("email", "")
      }}
    >Delete</button>
  )
}

const App = () => {
  const form = useForm()
  const email = form.get("email")


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
