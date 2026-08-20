import cartModel from "../models/cart.model.js";
import mongoose from "mongoose";


export async function getCartDetails(userId) {
   const cartResult = await cartModel.aggregate(
    [
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId)
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

  return cartResult;

}