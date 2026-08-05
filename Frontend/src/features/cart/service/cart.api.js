import axios from 'axios'

const cartApiInstance = axios.create({
    baseURL:'/api/cart',
    withCredentials:true
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

