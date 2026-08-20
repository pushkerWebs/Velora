import Razorpay from "razorpay"
import { CONFIG } from "../config/config.js"

const razorpay = new Razorpay({
  key_id: CONFIG.RAZORPAY_KEY_ID,
  key_secret: CONFIG.RAZORPAY_KEY_SECRET,
})


export const createOrder = async ({amount, currency="INR"}) => {
    const options = {
      amount: amount * 100, // Amount in paise
      currency: currency,
    }
    const order = await razorpay.orders.create(options)
    return order
  
}