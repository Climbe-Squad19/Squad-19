import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";

import { Toaster } from 'sonner'
import { router } from "./routes";

export function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster richColors />
    </Provider>
  )
}
