import express from "express";
import serverConfig from "./config/server.config.js";
import connectDb from "./config/db.config.js";
import { user } from "./router/user.routes.js";
import {createClient} from 'redis'
const app = express()

app.use(express.json());

const redisUrl = process.env.REDIS_URL

if(!redisUrl){
    console.log("Missing Redis Url");
    process.exit(1);
};
export const redisClient = createClient({
    url:redisUrl,
})

redisClient.connect().then(()=>{console.log("Connected to redis")}).catch((err)=>{console.error(err)})

user(app);

const server = async () =>{
    await connectDb();
    app.listen(serverConfig.PORT,()=>{
        console.log(`App is running On Port ${serverConfig.PORT}`);
        
    });
};

server();

