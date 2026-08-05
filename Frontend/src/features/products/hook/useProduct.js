import {
  createProduct,
  getSellerProduct,
  getAllProducts,
  getProductById,
  updateProductSizes,
  updateProduct,
} from "../services/product.api.js";
import { setSellerProducts, setProducts } from "../state/product.slice.js";
import { useDispatch, useSelector } from "react-redux";

export const useProduct = () => {
  const dispatch = useDispatch();
  const sellerProducts = useSelector((state) => state.product.sellerProducts);

  async function handleCreateProduct(formData) {
    const data = await createProduct(formData);
    return data.product;
  }

  async function handleGetSellerProduct() {
    const data = await getSellerProduct();
    dispatch(setSellerProducts(data.products));
    return data.products;
  }

  async function handleGetAllProducts() {
    try {
      const data = await getAllProducts();
      dispatch(setProducts(data?.products || []));
    } catch (err) {
      console.error("Failed to load products:", err);
      dispatch(setProducts([]));
    }
  }


  async function handleGetProductById(productId) {
    const data = await getProductById(productId);
    return data.product;
  }

  async function handleUpdateProductSizes(productId, sizes) {
    const data = await updateProductSizes(productId, sizes);
    // Update the product in sellerProducts list in redux
    if (sellerProducts) {
      const updated = sellerProducts.map((p) =>
        p._id === productId ? data.product : p
      );
      dispatch(setSellerProducts(updated));
    }
    return data.product;
  }

  async function handleUpdateProduct(productId, fields) {
    const data = await updateProduct(productId, fields);
    // Update the product in sellerProducts list in redux
    if (sellerProducts) {
      const updated = sellerProducts.map((p) =>
        p._id === productId ? data.product : p
      );
      dispatch(setSellerProducts(updated));
    }
    return data.product;
  }

  return {
    handleCreateProduct,
    handleGetSellerProduct,
    handleGetAllProducts,
    handleGetProductById,
    handleUpdateProductSizes,
    handleUpdateProduct,
  };
};
