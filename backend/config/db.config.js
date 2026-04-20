import mongoose from "mongoose";
import serverConfig from "./server.config.js";

const connectDb = async () =>{
    try{
        await mongoose.connect(serverConfig.MONGO_URI,{
            dbName:"MERNAuth"
        });
        console.log('MONGO Connected')
    }catch(err){
        console.log(err)
    };
};

export default connectDb;
