import express from 'express'
import { authenticateUser } from '../middlewares/auth.middleware.js'
import { validateAddToCart ,validateIncrementCartItem } from '../validator/cart.validator.js'
import { addToCart, getCart, decrementItem } from '../controllers/cart.controller.js'

const router = express.Router()


router.post('/:productId',authenticateUser,validateAddToCart,addToCart)
router.patch('/:productId',authenticateUser,decrementItem)
router.get('/',authenticateUser,getCart)
export default router
