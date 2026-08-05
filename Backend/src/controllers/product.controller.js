import productModel from "../models/product.model.js"
import { authenticateSeller } from "../middlewares/auth.middleware.js"
import { uploadFile } from "../services/storage.service.js"

export async function createProduct(req,res){
    const {title,description,price,currency,category} = req.body
    const seller = req.user

    try {
        const images = await Promise.all(req.files.map(async (file) => {
            const result = await uploadFile(file.buffer, file.originalname)
            return {
                url: result.url,
                alt: file.originalname
            }
        }))

        const product = await productModel.create({
            title,
            description,
            price:{
                amount: price,
                currency: currency || "INR"
            },
            category: category || "T-Shirts",
            images,
            seller:seller._id
        })

        res.status(201).json({
            message:"Product created successfully",
            success:true,
            product
        })
    } catch (error) {
        console.error("Create product error:", error.message, error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
}



export async function getSellerProducts(req,res){
    const seller = req.user
    const products = await productModel.find({seller:seller._id})
    res.status(200).json({
        message:"Products fetched successfully",
        success:true,
        products
    })
}


export async function getAllProducts(req,res){
const products = await productModel.find().populate("seller","name email")
res.status(200).json({
    message:"Products fetched successfully",
    success:true,
    products
})
}


export async function getProductDetails(req,res){
    const {id} = req.params
    const product = await productModel.findById(id)

    if(!product){
        return res.status(404).json({
            message:"Product not found",
            success:false
        })
    }

    res.status(200).json({
        message:"Product details fetched successfully",
        success:true,
        product
    })
}


export async function updateProductSizes(req, res) {
    const { id } = req.params
    const seller = req.user
    const { sizes } = req.body

    // sizes should be an array like [{ label: "XS", available: false }, ...]
    if (!Array.isArray(sizes)) {
        return res.status(400).json({ message: "sizes must be an array", success: false })
    }

    try {
        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        // Only the seller who owns this product can update sizes
        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You don't own this product", success: false })
        }

        const VALID_SIZES = ["XS", "S", "M", "L", "XL"]
        const normalized = VALID_SIZES.map(label => {
            const incoming = sizes.find(s => s.label === label)
            return {
                label,
                available: incoming ? Boolean(incoming.available) : true
            }
        })

        product.sizes = normalized
        await product.save()

        res.status(200).json({
            message: "Product sizes updated successfully",
            success: true,
            product
        })
    } catch (error) {
        console.error("Update sizes error:", error.message, error)
        res.status(500).json({ message: "Failed to update sizes", error: error.message })
    }
}


export async function updateProduct(req, res) {
    const { id } = req.params
    const seller = req.user
    const { title, description, price, currency, category, sizes } = req.body

    try {
        const product = await productModel.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found", success: false })
        }

        // Ownership check — only the seller who created this product can edit it
        if (product.seller.toString() !== seller._id.toString()) {
            return res.status(403).json({ message: "Forbidden: You don't own this product", success: false })
        }

        if (title !== undefined)       product.title       = title
        if (description !== undefined) product.description = description
        if (price !== undefined)       product.price.amount = Number(price)
        if (currency !== undefined)    product.price.currency = currency
        if (category !== undefined)    product.category    = category

        if (Array.isArray(sizes)) {
            const VALID_SIZES = product.category === "Jeans" ? ["28", "30", "32", "34"] : ["XS", "S", "M", "L", "XL"]
            product.sizes = VALID_SIZES.map(label => {
                const incoming = sizes.find(s => s.label === label)
                return {
                    label,
                    available: incoming ? Boolean(incoming.available) : true
                }
            })
        }

        await product.save()

        res.status(200).json({
            message: "Product updated successfully",
            success: true,
            product
        })
    } catch (error) {
        console.error("Update product error:", error.message, error)
        res.status(500).json({ message: "Failed to update product", error: error.message })
    }
}
