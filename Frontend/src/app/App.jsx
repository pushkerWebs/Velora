import { RouterProvider } from "react-router"
import { routes } from "./app.routes.jsx"
import { useAuth } from "../features/auth/hook/useAuth"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import CartToast from "../features/cart/components/CartToast.jsx"


function App() {
  const { handleGetMe } = useAuth()
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    handleGetMe()
  }, [])

  return (
    <>
      <CartToast />
      <RouterProvider router={routes} />
    </>
  )
}

export default App