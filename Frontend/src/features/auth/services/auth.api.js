import axios from "axios"
import { API_URL } from "../../../config/api.config.js"

const authApiInstance = axios.create({
    baseURL: `${API_URL}/api/auth`,
    withCredentials: true,
})

export async function register({fullname,contact,email,password,isSeller}){
    const response = await authApiInstance.post("/register",{
        email,
        contact,
        password,
        fullname,
        isSeller
    })
    return response.data
}

export async function login({email, password}){
    const response = await authApiInstance.post("/login",{email, password})
    return response.data
}


export async function getMe(){
    const response = await authApiInstance.get("/me")
    return response.data
}

export async function logout(){
    const response = await authApiInstance.post("/logout")
    return response.data
}

export async function toggleWishlistApi(productId){
    const response = await authApiInstance.post(`/wishlist/toggle/${productId}`)
    return response.data
}

export async function getWishlistApi(){
    const response = await authApiInstance.get("/wishlist")
    return response.data
}

export async function updateProfileApi({ fullname, contact, address }) {
    const response = await authApiInstance.put("/profile", { fullname, contact, address })
    return response.data
}