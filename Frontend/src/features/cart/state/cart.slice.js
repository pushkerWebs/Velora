import { createSlice } from "@reduxjs/toolkit"

const cartSlice = createSlice({
    name: "cart",
    initialState: {
        totalPrice: 0,
        totalSavings: 0,
        currency: "INR",
        items: [],
        toast: null,      // { type: 'success'|'error', message: string } | null
        loading: false,
    },
    reducers: {
        setCart: (state, action) => {
            state.items = action.payload.items || []
            state.totalPrice = action.payload.totalPrice ?? 0
            state.totalSavings = action.payload.totalSavings ?? 0
            state.currency = action.payload.currency || "INR"
        },
        setCartLoading: (state, action) => {
            state.loading = action.payload
        },
        showToast: (state, action) => {
            // action.payload: { type: 'success'|'error', message: string }
            state.toast = action.payload
        },
        hideToast: (state) => {
            state.toast = null
        },
    }
});

export const { setCart, setCartLoading, showToast, hideToast } = cartSlice.actions;
export default cartSlice.reducer;