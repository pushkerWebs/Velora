import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import { validateAddToCart, validateIncrementCartItem } from '../validator/cart.validator.js'
import { addToCart, getCart, decrementItem, createOrderController, verifyOrderController, getUserOrders, createDirectOrderController } from '../controllers/cart.controller.js'

const router = express.Router()


router.post('/:productId', authenticateUser, validateAddToCart, addToCart)
router.patch('/:productId', authenticateUser, decrementItem)
router.get('/', authenticateUser, getCart)


router.post("/payment/create/order", authenticateUser, createOrderController)
router.post("/payment/create/direct-order", authenticateUser, createDirectOrderController)
router.post("/payment/verify/order", authenticateUser, verifyOrderController)
router.get("/payment/orders", authenticateUser, getUserOrders)

export default router
