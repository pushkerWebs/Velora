import axios from 'axios'
import { API_URL } from '../../../config/api.config.js'

const cartApiInstance = axios.create({
    baseURL: `${API_URL}/api/cart`,
    withCredentials: true
})

export const addItem = async ({productId, quantity = 1}) => {
    const response = await cartApiInstance.post(`/${productId}`, { quantity })
    return response.data
}

export const decrementItem = async ({productId}) => {
    const response = await cartApiInstance.patch(`/${productId}`)
    return response.data
}

export const getCart = async () => {
    const response = await cartApiInstance.get('/')
    return response.data
}


export const createCartOrder = async({ couponCode } = {}) => {
    const response = await cartApiInstance.post('/payment/create/order', { couponCode })
    return response.data
}

export const verifyCartOrder = async({razorpay_order_id, razorpay_payment_id, razorpay_signature}) => {
    const response = await cartApiInstance.post('/payment/verify/order', {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    })
    return response.data
}

export const getUserOrders = async () => {
    const response = await cartApiInstance.get('/payment/orders')
    return response.data
}

export const createDirectOrder = async ({ productId, quantity = 1, couponCode }) => {
    const response = await cartApiInstance.post('/payment/create/direct-order', { productId, quantity, couponCode })
    return response.data
}