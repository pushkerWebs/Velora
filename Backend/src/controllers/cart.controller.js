import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js";
import { stockOfVariant } from "../dao/product.dao.js"
import { createOrder } from "../services/payment.service.js"
import { getCartDetails } from "../dao/cart.dao.js"
import paymentModel from "../models/payment.model.js"
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js"
import mongoose from "mongoose";
import { CONFIG } from "../config/config.js"

export const addToCart = async (req, res) => {
  const { productId } = req.params
  const { quantity = 1 } = req.body
  const userId = req.user._id

  const product = await productModel.findOne({
    _id: productId,
  })

  if (!product) {
    return res.status(404).json({ message: "Product not found", success: false })
  }

  const stock = await stockOfVariant(productId)

  const cart = await cartModel.findOne({ user: userId }) ||
    (await cartModel.create({ user: userId }))

  const isProductInCart = cart.items.some(item => item.product.toString() === productId)

  if (isProductInCart) {
    const quantityInCart = cart.items.find(item => item.product.toString() === productId).quantity
    if (quantityInCart + quantity > stock) {
      return res.status(400).json({ message: `Only ${stock} units available`, success: false })
    }
    await cartModel.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true }
    )
    return res.status(200).json({ message: "Cart updated in cart", success: true })
  }

  if (quantity > stock) {
    return res.status(400).json({ message: `Only ${stock} units available`, success: false })
  }

  cart.items.push({ product: productId, quantity, price: product.price })

  await cart.save()

  return res.status(200).json({ message: "Product added to cart", success: true })
}



export const getCart = async (req, res) => {
  const user = req.user
  const userObjectId = new mongoose.Types.ObjectId(user._id)

  let cartResult = await getCartDetails(userObjectId)

  let cartData;
  if (!cartResult || cartResult.length === 0) {
    let rawCart = await cartModel.findOne({ user: user._id });
    if (!rawCart) {
      rawCart = await cartModel.create({ user: user._id, items: [] });
    }
    cartData = {
      _id: rawCart._id,
      user: rawCart.user,
      items: (rawCart.items || []).map(item => ({
        ...(item.toObject ? item.toObject() : item),
        subtotal: item.quantity * (item.price?.amount || 0),
        savings: 0
      })),
      totalPrice: 0,
      totalSavings: 0,
      currency: 'INR'
    };
  } else {
    cartData = cartResult[0];
  }

  return res.status(200).json({ message: "Cart retrieved", success: true, cart: cartData });
}


export const decrementItem = async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id

  const cart = await cartModel.findOne({ user: userId })
  if (!cart) {
    return res.status(404).json({ message: "Cart not found", success: false })
  }

  const item = cart.items.find(i => i.product.toString() === productId)
  if (!item) {
    return res.status(404).json({ message: "Item not in cart", success: false })
  }

  if (item.quantity <= 1) {
    // remove item entirely
    await cartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    )
    return res.status(200).json({ message: "Item removed from cart", success: true })
  }

  // decrement by 1
  await cartModel.findOneAndUpdate(
    { user: userId, "items.product": productId },
    { $inc: { "items.$.quantity": -1 } },
    { new: true }
  )
  return res.status(200).json({ message: "Cart updated", success: true })
}


export const createOrderController = async (req, res) => {
  const cartResult = await getCartDetails(req.user._id)

  if (!cartResult || cartResult.length === 0) {
    return res.status(400).json({ message: "Cart is empty", success: false })
  }

  const cart = cartResult[0]

  const { couponCode } = req.body
  let finalPrice = cart.totalPrice

  if (couponCode) {
    if (couponCode === "VELORA10") {
      finalPrice = Math.round(cart.totalPrice * 0.9)
    } else if (couponCode === "VELORASTYLE") {
      if (cart.totalPrice < 2999) {
        return res.status(400).json({ message: "VELORASTYLE requires order amount above ₹2,999", success: false })
      }
      finalPrice = Math.round(cart.totalPrice * 0.85)
    } else {
      return res.status(400).json({ message: "Invalid coupon code", success: false })
    }
  }

  const order = await createOrder({ amount: finalPrice, currency: cart.currency })

  const payment = await paymentModel.create({
    user: req.user._id,
    razorpay: {
      orderId: order.id
    },
    price: {
      amount: finalPrice,
      currency: cart.currency
    },
    orderItems: cart.items.map(item => ({
      title: item.product.title,
      productId: item.product._id,
      quantity: item.quantity,
      price: {
        amount: item.price?.amount ?? item.product?.price?.amount,
        currency: item.price?.currency ?? item.product?.price?.currency ?? 'INR'
      },
      images: item.product.images,
      description: item.product.description,
      category: item.product.category
    }))
  })

  return res.status(200).json({ message: "Order created", success: true, order })
}

export const createDirectOrderController = async (req, res) => {
  const { productId, quantity = 1, couponCode } = req.body
  const userId = req.user._id

  const product = await productModel.findById(productId)
  if (!product) {
    return res.status(404).json({ message: "Product not found", success: false })
  }

  const stock = await stockOfVariant(productId)
  if (quantity > stock) {
    return res.status(400).json({ message: `Only ${stock} units available`, success: false })
  }

  const priceAmount = product.price?.amount || 0
  const currency = product.price?.currency || 'INR'
  const subtotal = priceAmount * quantity

  let finalPrice = subtotal
  if (couponCode) {
    if (couponCode === "VELORA10") {
      finalPrice = Math.round(subtotal * 0.9)
    } else if (couponCode === "VELORASTYLE") {
      if (subtotal < 2999) {
        return res.status(400).json({ message: "VELORASTYLE requires order amount above ₹2,999", success: false })
      }
      finalPrice = Math.round(subtotal * 0.85)
    } else {
      return res.status(400).json({ message: "Invalid coupon code", success: false })
    }
  }

  const order = await createOrder({ amount: finalPrice, currency })

  const payment = await paymentModel.create({
    user: userId,
    razorpay: {
      orderId: order.id
    },
    price: {
      amount: finalPrice,
      currency
    },
    orderItems: [{
      title: product.title,
      productId: product._id,
      quantity,
      price: {
        amount: priceAmount,
        currency
      },
      images: product.images,
      description: product.description,
      category: product.category
    }]
  })

  return res.status(200).json({ message: "Order created successfully", success: true, order })
}



export const verifyOrderController = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

  const payment = await paymentModel.findOne({ "razorpay.orderId": razorpay_order_id, status: "pending" })

  if (!payment) {
    return res.status(404).json({ message: "Payment not found", success: false })
  }

  const isPaymentValid = validatePaymentVerification({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id,
  }, razorpay_signature, CONFIG.RAZORPAY_KEY_SECRET)

  if (!isPaymentValid) {
    payment.status = "failed"
    await payment.save()
    return res.status(400).json({ message: "Payment verification failed", success: false })
  }

  payment.status = "paid"
  payment.razorpay.paymentId = razorpay_payment_id
  payment.razorpay.signature = razorpay_signature
  await payment.save()

  return res.status(200).json({ message: "Payment verified successfully", success: true })
}

export const getUserOrders = async (req, res) => {
  try {
    const orders = await paymentModel.find({ user: req.user._id, status: "paid" }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Orders retrieved successfully", success: true, orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return res.status(500).json({ message: "Error retrieving orders", error: error.message, success: false });
  }
};