import {body,validationResult} from "express-validator"

 
 function validateRequest (req, res, next){
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({
            message:"Validation failed",
            errors:errors.array()
        })
    }
    next()
}

export const createProductValidator = [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("currency").notEmpty().withMessage("Currency is required"),
    validateRequest
]