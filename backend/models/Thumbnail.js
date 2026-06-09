import mongoose from 'mongoose';

const thumbnailschema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user",
        index:true
    },
    title:{
        type:String, required:true, trim:true
    },
    enhancedPrompt:{
        type:String 
    },
    imageUrl:{
        type:String, required:true
    },
}, {timestamps:true});


export const thumbnail = mongoose.model("thumbnail", thumbnailschema)