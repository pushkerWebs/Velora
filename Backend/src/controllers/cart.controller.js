import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js";
import {stockOfVariant} from "../dao/product.dao.js"
import mongoose from "mongoose";

export const addToCart = async (req, res) => {
  const {productId} = req.params
  const {quantity = 1 } = req.body
  const userId = req.user._id

  const  product = await productModel.findOne({
    _id: productId,
  })

  if(!product){
    return res.status(404).json({message:"Product not found",success:false})
  }

  const stock = await stockOfVariant(productId)

  const cart = await cartModel.findOne({user:userId}) ||
    (await cartModel.create({user:userId}))

    const isProductInCart = cart.items.some(item => item.product.toString() === productId)

    if(isProductInCart){
     const quantityInCart = cart.items.find(item => item.product.toString() === productId).quantity
     if(quantityInCart + quantity > stock){
      return res.status(400).json({message:`Only ${stock} units available`,success:false})
     }
     await cartModel.findOneAndUpdate(
      {user:userId,"items.product":productId},
      {$inc:{"items.$.quantity":quantity}},
      {new:true}
     )
     return res.status(200).json({message:"Cart updated in cart",success:true})
    }

    if(quantity > stock){
      return res.status(400).json({message:`Only ${stock} units available`,success:false})
    }

    cart.items.push({product:productId,quantity,price:product.price})

    await cart.save()

    return res.status(200).json({message:"Product added to cart",success:true})
}


export const getCart = async (req,res) => {
  const user = req.user
  const userObjectId = new mongoose.Types.ObjectId(user._id)

  const cartResult = await cartModel.aggregate(
    [
      {
        $match: {
          user: userObjectId
        }
      },
      { $unwind: { path: '$items' } },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'items.product'
        }
      },
      { $unwind: { path: '$items.product' } },
      {
        $addFields: {
          'items.subtotal': {
            $multiply: [
              '$items.quantity',
              { $ifNull: ['$items.product.price.amount', '$items.price.amount'] }
            ]
          },
          'items.savings': {
            $cond: [
              {
                $and: [
                  { $ne: ['$items.price.amount', null] },
                  { $gt: ['$items.price.amount', '$items.product.price.amount'] }
                ]
              },
              {
                $multiply: [
                  '$items.quantity',
                  { $subtract: ['$items.price.amount', '$items.product.price.amount'] }
                ]
              },
              0
            ]
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          totalPrice: {
            $sum: '$items.subtotal'
          },
          totalSavings: {
            $sum: '$items.savings'
          },
          currency: {
            $first: { $ifNull: ['$items.product.price.currency', '$items.price.currency'] }
          },
          items: { $push: '$items' }
        }
      }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );

  let cartData;
  if (!cartResult || cartResult.length === 0) {
    let rawCart = await cartModel.findOne({ user: user._id });
    if (!rawCart) {
      rawCart = await cartModel.create({ user: user._id, items: [] });
    }
    cartData = {
      _id: rawCart._id,
      user: rawCart.user,
      items: (rawCart.items || []).map(item => ({
        ...(item.toObject ? item.toObject() : item),
        subtotal: item.quantity * (item.price?.amount || 0),
        savings: 0
      })),
      totalPrice: 0,
      totalSavings: 0,
      currency: 'INR'
    };
  } else {
    cartData = cartResult[0];
  }

  return res.status(200).json({ message: "Cart retrieved", success: true, cart: cartData });
}


export const decrementItem = async (req, res) => {
  const { productId } = req.params
  const userId = req.user._id

  const cart = await cartModel.findOne({ user: userId })
  if (!cart) {
    return res.status(404).json({ message: "Cart not found", success: false })
  }

  const item = cart.items.find(i => i.product.toString() === productId)
  if (!item) {
    return res.status(404).json({ message: "Item not in cart", success: false })
  }

  if (item.quantity <= 1) {
    // remove item entirely
    await cartModel.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    )
    return res.status(200).json({ message: "Item removed from cart", success: true })
  }

  // decrement by 1
  await cartModel.findOneAndUpdate(
    { user: userId, "items.product": productId },
    { $inc: { "items.$.quantity": -1 } },
    { new: true }
  )
  return res.status(200).json({ message: "Cart updated", success: true })
}
