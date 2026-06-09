import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    credits:{
        type:Number,
        default:10
    },
}, {timestamps:true});


export const User = mongoose.models.user || mongoose.model("user", userSchema)