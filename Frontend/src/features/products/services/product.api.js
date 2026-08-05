import axios from 'axios'
import { API_URL } from '../../../config/api.config.js'

const productApiInstance = axios.create({
    baseURL: `${API_URL}/api/products`,
    withCredentials: true,
})



export async function createProduct(formData) {
    const response = await productApiInstance.post("/", formData)
    return response.data
}


export async function getSellerProduct(){
    const response = await productApiInstance.get("/seller")
    return response.data
}

export async function getAllProducts(){
    const response = await productApiInstance.get("/")
    return response.data
}

export async function getProductById(productId){
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data
}

export async function updateProductSizes(productId, sizes){
    const response = await productApiInstance.patch(`/${productId}/sizes`, { sizes })
    return response.data
}

export async function updateProduct(productId, data){
    const response = await productApiInstance.put(`/${productId}`, data)
    return response.data
}
