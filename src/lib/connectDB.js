"use server"
import mongoose from "mongoose"
const connectDB = async() =>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to the MongoDb database successfully")
    }
    catch(e){
        console.log("Error connecting to the MongoDb database")
    }
}
export default connectDB;