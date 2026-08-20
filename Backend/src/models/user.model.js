import mongoose, { mongo } from "mongoose"
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    email:{type:String,required:true,unique:true}, 
    contact:{type:String,required:true},
    password:{type:String,required:true},
    fullname:{type:String,required:true},
    role:{type:String,enum:["buyer","seller"],default:"buyer"},
    wishlist:[{type: mongoose.Schema.Types.ObjectId, ref: 'Product'}],
    address:{type:String,default:""}
})

userSchema.pre('save', async function(){
    if(!this.isModified('password')) return;

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

const userModel = mongoose.model('User',userSchema)


export default userModel