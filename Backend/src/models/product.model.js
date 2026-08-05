import mongoose from "mongoose"
import priceSchema from "./price.schema.js"
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"]
const JEANS_SIZES = ["28", "30", "32", "34"]

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    seller:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    price:{
        type:priceSchema,
        required:true
    },
    images:[
        {
            url:{
                type:String,
                required:true
            },
            alt:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type:String,
        enum:["Jeans","T-Shirts","Shirts"],
        default:"T-Shirts"
    },
    sizes:{
        type:[
            {
                label:{
                    type:String,
                    enum:["XS","S","M","L","XL","28","30","32","34"],
                    required:true
                },
                available:{
                    type:Boolean,
                    default:true
                }
            }
        ],
        default: function() {
            const sizeList = this.category === "Jeans" ? JEANS_SIZES : DEFAULT_SIZES;
            return sizeList.map(label => ({ label, available: true }));
        }
    }
},{timestamps:true})


const productModel = mongoose.model("Product",productSchema)
export default productModel
