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

