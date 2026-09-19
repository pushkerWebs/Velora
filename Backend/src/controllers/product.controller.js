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


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

function parseSearchQueryTokens(rawQuery) {
    if (!rawQuery || typeof rawQuery !== "string") {
        return { detectedCategory: null, attributeTokens: [] };
    }

    let query = rawQuery.trim().toLowerCase().replace(/\s+/g, " ");
    let detectedCategory = null;

    // 1. Detect T-Shirt variants in query string
    // e.g. "t-shirt", "t shirt", "tshirt", "tee shirt", "tee"
    const tShirtRegex = /\b(t[- ]?shirts?|tshirts?|tee[- ]?shirts?|tees?)\b/gi;
    if (tShirtRegex.test(query)) {
        detectedCategory = "T-Shirts";
        query = query.replace(tShirtRegex, "").trim();
    } 
    // 2. Detect Shirt variants (only if T-Shirt wasn't matched)
    else {
        const shirtRegex = /\b(shirts?)\b/gi;
        if (shirtRegex.test(query)) {
            detectedCategory = "Shirts";
            query = query.replace(shirtRegex, "").trim();
        } 
        // 3. Detect Jeans variants
        else {
            const jeansRegex = /\b(jeans?|denim)\b/gi;
            if (jeansRegex.test(query)) {
                detectedCategory = "Jeans";
                query = query.replace(jeansRegex, "").trim();
            }
        }
    }

    // 4. Extract remaining tokens (colors, fit styles, materials, keywords)
    const attributeTokens = query
        .split(" ")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

    return { detectedCategory, attributeTokens };
}

function buildProductSearchQuery(rawSearch, rawCategory) {
    const queryConditions = [];

    // 1. Explicit Category parameter handling (from UI / URL dropdown)
    if (rawCategory && rawCategory !== "All") {
        const cat = rawCategory.trim();
        if (cat === "Full Sleeve") {
            queryConditions.push({
                $or: [
                    { title: { $regex: /\bfull[- ]?sleeves?\b/i } },
                    { description: { $regex: /\bfull[- ]?sleeves?\b/i } }
                ]
            });
        } else if (cat === "Boxy Fit") {
            queryConditions.push({
                $or: [
                    { title: { $regex: /\bboxy\b/i } },
                    { description: { $regex: /\bboxy\b/i } }
                ]
            });
        } else if (cat === "Linen") {
            queryConditions.push({
                $or: [
                    { title: { $regex: /\blinen\b/i } },
                    { description: { $regex: /\blinen\b/i } },
                    { category: { $regex: /\blinen\b/i } }
                ]
            });
        } else {
            // Standard category enum match: "Jeans", "T-Shirts", "Shirts"
            queryConditions.push({ category: { $regex: new RegExp(`^${escapeRegex(cat)}$`, "i") } });
        }
    }

    // 2. Multi-word Search Query Handling (AND Logic + Token Normalization)
    if (rawSearch && typeof rawSearch === "string" && rawSearch.trim()) {
        const { detectedCategory, attributeTokens } = parseSearchQueryTokens(rawSearch);

        // A. Strict Product Type Isolation
        if (detectedCategory === "T-Shirts") {
            queryConditions.push({
                $or: [
                    { category: "T-Shirts" },
                    { title: { $regex: /\b(t[- ]?shirts?|tshirts?|tee[- ]?shirts?|tees?)\b/i } }
                ]
            });
        } else if (detectedCategory === "Shirts") {
            queryConditions.push({
                $and: [
                    {
                        $or: [
                            { category: "Shirts" },
                            { title: { $regex: /\bshirts?\b/i } }
                        ]
                    },
                    { category: { $ne: "T-Shirts" } },
                    { title: { $not: { $regex: /\b(t[- ]?shirts?|tshirts?|tee[- ]?shirts?|tees?)\b/i } } }
                ]
            });
        } else if (detectedCategory === "Jeans") {
            queryConditions.push({
                $or: [
                    { category: "Jeans" },
                    { title: { $regex: /\bjeans?\b/i } }
                ]
            });
        }

        // B. Attribute Tokens (AND Logic: Every attribute token must be satisfied)
        for (const token of attributeTokens) {
            let tokenRegex;
            const normToken = token.toLowerCase();
            if (normToken === "stripped" || normToken === "striped") {
                tokenRegex = /\bstrip{1,2}ed\b/i;
            } else if (normToken === "half-sleeve" || normToken === "half") {
                tokenRegex = /\bhalf[- ]?sleeves?\b/i;
            } else if (normToken === "full-sleeve" || normToken === "full") {
                tokenRegex = /\bfull[- ]?sleeves?\b/i;
            } else {
                const escaped = escapeRegex(token);
                tokenRegex = new RegExp(`\\b${escaped}\\b|${escaped}`, "i");
            }
            queryConditions.push({
                $or: [
                    { title: tokenRegex },
                    { category: tokenRegex },
                    { description: tokenRegex }
                ]
            });
        }
    }

    if (queryConditions.length === 0) {
        return {};
    }

    if (queryConditions.length === 1) {
        return queryConditions[0];
    }

    return { $and: queryConditions };
}

/**
 * Post-query safety filter: removes products whose title clearly belongs
 * to a different category than what was requested.
 * Uses word-boundary regex to avoid false positives (e.g. "Jean-Paul" is fine).
 */
function filterMisclassifiedProducts(products, requestedCategory) {
    if (!requestedCategory || requestedCategory === "All" || !products.length) {
        return products;
    }

    const cat = requestedCategory.trim();

    if (cat === "T-Shirts") {
        // Exclude products whose title screams "jeans" but aren't categorized as T-Shirts by title
        const jeansPattern = /\bjeans?\b/i;
        const tshirtPattern = /\b(t[- ]?shirts?|tshirts?|tee[- ]?shirts?|tees?)\b/i;
        return products.filter((p) => {
            const title = p.title || "";
            // If title contains "jeans" and does NOT contain "t-shirt", it's misclassified
            if (jeansPattern.test(title) && !tshirtPattern.test(title)) return false;
            return true;
        });
    }

    if (cat === "Jeans") {
        const shirtPattern = /\b(t[- ]?shirts?|tshirts?|shirts?)\b/i;
        const jeansPattern = /\bjeans?\b/i;
        return products.filter((p) => {
            const title = p.title || "";
            if (shirtPattern.test(title) && !jeansPattern.test(title)) return false;
            return true;
        });
    }

    if (cat === "Shirts") {
        const jeansPattern = /\bjeans?\b/i;
        const tshirtPattern = /\b(t[- ]?shirts?|tshirts?|tee[- ]?shirts?|tees?)\b/i;
        return products.filter((p) => {
            const title = p.title || "";
            if (jeansPattern.test(title) && !(/\bshirts?\b/i).test(title)) return false;
            if (tshirtPattern.test(title)) return false;
            return true;
        });
    }

    return products;
}

function rankProductsByRelevance(products, rawSearch) {
    if (!rawSearch || typeof rawSearch !== "string" || !rawSearch.trim()) {
        return products;
    }

    const cleanQuery = rawSearch.trim().toLowerCase();
    const { detectedCategory, attributeTokens } = parseSearchQueryTokens(rawSearch);
    const searchWords = cleanQuery.split(" ").filter(Boolean);

    const scoredProducts = products.map((product) => {
        let score = 0;
        const titleLower = (product.title || "").toLowerCase();
        const categoryLower = (product.category || "").toLowerCase();
        const descLower = (product.description || "").toLowerCase();

        // 1. Exact Title match / Title contains full query boost
        if (titleLower === cleanQuery) score += 200;
        else if (titleLower.includes(cleanQuery)) score += 100;

        // 2. Category detection match boost
        if (detectedCategory) {
            const normCategory = detectedCategory.toLowerCase();
            if (categoryLower === normCategory) score += 80;
            else if (titleLower.includes(normCategory)) score += 50;
        }

        // 3. Attribute tokens match score
        for (const token of attributeTokens) {
            const tokLower = token.toLowerCase();
            if (titleLower.includes(tokLower)) score += 30;
            if (categoryLower.includes(tokLower)) score += 20;
            if (descLower.includes(tokLower)) score += 5;
        }

        // 4. All search words present in title boost
        const allInTitle = searchWords.every((w) => titleLower.includes(w));
        if (allInTitle) score += 60;

        return { product, score };
    });

    scoredProducts.sort((a, b) => b.score - a.score);
    return scoredProducts.map((item) => item.product);
}

export async function getAllProducts(req, res) {
    try {
        const { search, category } = req.query;
        const queryFilter = buildProductSearchQuery(search, category);

        const products = await productModel
            .find(queryFilter)
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        // Safety net: remove products whose title clearly contradicts the requested category
        const filteredProducts = filterMisclassifiedProducts(products || [], category);
        const rankedProducts = rankProductsByRelevance(filteredProducts, search);

        res.status(200).json({
            message: "Products fetched successfully",
            success: true,
            products: rankedProducts
        });
    } catch (error) {
        console.error("Get all products error:", error.message, error);
        res.status(500).json({
            message: "Failed to fetch products",
            success: false,
            error: error.message
        });
    }
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
