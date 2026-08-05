import { createProduct, getAllProducts, getSellerProducts, getProductDetails, updateProductSizes, updateProduct } from '../controllers/product.controller.js';
import { authenticateSeller } from '../middlewares/auth.middleware.js'
import { createProductValidator } from '../validator/product.validator.js'
import express from 'express'
import multer from 'multer'


const router = express.Router()
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
})

router.post("/", authenticateSeller, upload.array("images", 7), createProductValidator, createProduct);

router.get("/seller", authenticateSeller, getSellerProducts)

router.get("/", getAllProducts)

router.get("/detail/:id", getProductDetails)

// Seller-only: update entire product (ownership enforced in controller)
router.put("/:id", authenticateSeller, updateProduct)

// Seller-only: update only sizes (ownership enforced in controller)
router.patch("/:id/sizes", authenticateSeller, updateProductSizes)

export default router
