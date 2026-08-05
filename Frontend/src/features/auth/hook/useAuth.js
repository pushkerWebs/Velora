import { setError, setUser, setloading } from "../state/auth.slice";
import { register, login, getMe, logout } from "../services/auth.api";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { loading, error, user } = useSelector((state) => state.auth);

    async function handleRegister({ email, password, contact, fullname, isSeller = false }) {
        try {
            dispatch(setloading(true));
            dispatch(setError(null));
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return { success: true , user:data.user};
        } catch (err) {
            const data = err?.response?.data;
            const message =
                data?.message ||
                (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
                "Registration failed. Please try again.";
            dispatch(setError(message));
            return { success: false, message};
        } finally {
            dispatch(setloading(false));
        }
    }

    async function handleLogin({ email, password, role }) {
        try {
            dispatch(setloading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            if (role && data.user.role !== role) {
                const message = `Access denied. This account is registered as a ${data.user.role}, not a ${role}.`;
                dispatch(setError(message));
                return { success: false, message , user:data.user};
            }
            dispatch(setUser(data.user));
            return { success: true, user: data.user };
        } catch (err) {
            const data = err?.response?.data;
            const message =
                data?.message ||
                (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
                "Login failed. Please try again.";
            dispatch(setError(message));
            return { success: false, message };
        } finally {
            dispatch(setloading(false));
        }
    }

    async function handleGetMe(){
        try{
            dispatch(setloading(true))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            // 401 means the user is simply not logged in — expected, don't surface as error
            if (err?.response?.status !== 401) {
                const data = err?.response?.data;
                const message =
                    data?.message ||
                    (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
                    "Failed to fetch user details.";
                dispatch(setError(message));
            }
            dispatch(setUser(null));
        } finally {
            dispatch(setloading(false))
        }
    } 

    async function handleLogout() {
        try {
            dispatch(setloading(true))
            localStorage.removeItem("velora_wishlist_ids")
            window.dispatchEvent(new Event("wishlist-updated"))
            await logout()
            dispatch(setUser(null))
            window.location.href = "/"
            return { success: true }
        } catch (err) {
            localStorage.removeItem("velora_wishlist_ids")
            window.dispatchEvent(new Event("wishlist-updated"))
            dispatch(setUser(null))
            window.location.href = "/"
            return { success: true }
        } finally {
            dispatch(setloading(false))
        }
    }

    return { handleRegister, handleLogin, handleGetMe, handleLogout, loading, error, user };
};