import { createSlice } from "@reduxjs/toolkit";



const authSlice = createSlice({
    name:'auth',
    initialState:{
        user:null,
        loading:true,
        error:null,
    },
    reducers:{
        setUser:(state,action)=>{
            state.user=action.payload
        },
        setloading:(state,action)=>{
            state.loading=action.payload
        },
        setError:(state,action)=>{
            state.error = action.payload
        }
    }
})

export const {setError,setloading,setUser} = authSlice.actions
export default authSlice.reducer