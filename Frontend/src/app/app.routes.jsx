import { createBrowserRouter } from "react-router";
import SmoothScroll from "../components/SmoothScroll.jsx";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login";
import CreateProduct from "../features/products/pages/CreateProduct";
import Dashboard from "../features/products/pages/Dashboard";
import Protected from "../features/auth/components/Protected";
import Home from "../features/products/pages/Home";
import Products from "../features/products/pages/Products";
import ProductDetail from "../features/products/pages/ProductDetail";
import Cart from "../features/cart/pages/Cart";
import CategoryPage from "../features/products/pages/CategoryPage";
import Wishlist from "../features/products/pages/Wishlist";
import Profile from "../features/auth/pages/Profile";

export const routes = createBrowserRouter([
  {
    element: <SmoothScroll />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/jeans",
        element: <CategoryPage category="Jeans" />,
      },
      {
        path: "/t-shirts",
        element: <CategoryPage category="T-Shirts" />,
      },
      {
        path: "/shirts",
        element: <CategoryPage category="Shirts" />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "product/:productId",
        element: <ProductDetail />,
      },
      {
        path: "/cart",
        element: (
          <Protected>
            <Cart />
          </Protected>
        ),
      },
      {
        path: "/profile",
        element: (
          <Protected>
            <Profile />
          </Protected>
        ),
      },
      {
        path: "/seller",
        children: [
          {
            path: "create-product",
            element: (
              <Protected role="seller">
                <CreateProduct />
              </Protected>
            ),
          },
          {
            path: "dashboard",
            element: (
              <Protected role="seller">
                <Dashboard />
              </Protected>
            ),
          },
        ],
      },
    ],
  },
]);