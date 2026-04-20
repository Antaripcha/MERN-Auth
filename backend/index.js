import express from "express";
import serverConfig from "./config/server.config.js";
import connectDb from "./config/db.config.js";
import { user } from "./router/user.routes.js";
const app = express()

app.use(express.json());

user(app);

const server = async () =>{
    await connectDb();
    app.listen(serverConfig.PORT,()=>{
        console.log(`App is running On Port ${serverConfig.PORT}`);
        
    });
};

server();

