import { RouterProvider } from "react-router"
import { routes } from "./app.routes.jsx"
import { useAuth } from "../features/auth/hook/useAuth"
import { useEffect, useRef } from "react"
import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import CartToast from "../features/cart/components/CartToast.jsx"
import Preloader from "../components/preloader/Preloader.jsx"
import { usePreloader } from "../components/preloader/usePreloader.js"
import CustomCursor from "../components/CustomCursor.jsx"

function App() {
  const { handleGetMe } = useAuth()
  const user = useSelector((state) => state.auth.user)
  const authPromiseRef = useRef(null)

  useEffect(() => {
    authPromiseRef.current = handleGetMe()
  }, [])

  const { shouldShow, progress, phase, isRevealing, isComplete } = usePreloader(authPromiseRef.current)

  return (
    <>
      <Preloader
        shouldShow={shouldShow}
        progress={progress}
        phase={phase}
        isRevealing={isRevealing}
        isComplete={isComplete}
      />
      <CartToast />
      <motion.div
        className="w-full min-h-screen"
        initial={shouldShow ? { scale: 0.98, opacity: 0.95 } : false}
        animate={
          shouldShow
            ? {
              scale: isRevealing ? 1.0 : 0.98,
              opacity: isRevealing ? 1.0 : 0.95,
            }
            : { scale: 1.0, opacity: 1.0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.65, 0, 0.35, 1],
        }}
        style={isComplete || !shouldShow ? undefined : { transformOrigin: "center center", willChange: "transform, opacity" }}
      >
        <CustomCursor />
        <RouterProvider router={routes} />
      </motion.div>
    </>
  )
}

export default App