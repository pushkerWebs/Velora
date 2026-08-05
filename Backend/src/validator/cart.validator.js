import {param,body,validationResult} from "express-validator"

const validateRequest = (req,res,next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    next()
}

export const validateAddToCart = [
   param("productId").isMongoId().withMessage("Invalid product ID"),
   body("quantity").isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
   validateRequest
]

export const validateIncrementCartItem = [
    param("productId").isMongoId().withMessage("Invalid product ID"),
    validateRequest
]