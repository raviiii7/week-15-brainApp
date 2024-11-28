import mongoose, {model, Schema} from "mongoose";
mongoose.connect("mongodb://localhost:27017/brainly")
const UserSchema = new Schema({
    username : String,
    password : String
})

export const UserModel = model("User" , UserSchema);