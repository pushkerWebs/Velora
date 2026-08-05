import productModel from "../models/product.model.js";

export const stockOfVariant = async (productId) => {
  const product = await productModel.findOne({
    _id: productId,
  })
  const stock = product.stock;
  return stock;
};