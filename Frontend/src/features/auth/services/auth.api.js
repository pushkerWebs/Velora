import axios from "axios"

const authApiInstance = axios.create({
    baseURL:"http://localhost:3000/api/auth",
    withCredentials:true,
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