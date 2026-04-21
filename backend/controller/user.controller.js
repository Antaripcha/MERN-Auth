import { registerSchema } from '../config/zod.js';
import { redisClient } from '../index.js';
import TryCatch from '../middleware/TryCatch.js';
import sanitize from 'mongo-sanitize';
import { User } from '../models/User.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import { sendMail } from '../config/sendMail.config.js';
import { getVerifyEmailHtml } from '../config/html.js';

export const registerUser = TryCatch(async(req,res)=>{
    const sanitizeBody = sanitize(req.body);
    const validation = registerSchema.safeParse(sanitizeBody)
    //const {name,email,password} = sanitize(req.body)

    if(!validation.success){
        //const zodError = validation.error.message;
        const zodError = validation.error;
        let firstErrorMeaaage = "Validation failed";
        let allErrors = [];
        if(zodError?.issues && Array.isArray(zodError.issues)){
            allErrors = zodError.issues.map((issue)=>({
                field : issue.path ? issue.path.join('.') : "unknown",
                message: issue.message || "Validation Error",
                code : issue.code
            }));
            firstErrorMeaaage = allErrors[0]?.message || "validation Error";
        }

        return res.status(400).json({
            //message:zodError
            message:firstErrorMeaaage,
            error:allErrors
        })
    }
    
    const {name,email,password} = validation.data;

    const reatLimitKey = `register-rate-limit:$(req.ip):${email}`
    if(await redisClient.get(reatLimitKey)){
        return res.status(429).json({
            message:"Too many request, try again later",
        });
    };

    const existingUser = await User.findOne({email})

    if(existingUser){
        return res.status(400).json({
            message:"User Already exists"
        });
    };

    const hashPassword = await bcrypt.hash(password,10);

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyKey = `verify:${verifyToken}`

    const datatoStore = JSON.stringify({
        name,
        email,
        password:hashPassword,
    });

    await redisClient.set(verifyKey,datatoStore,{EX : 300});

    const subject = "verify your email for Account creation";
    // console.log(verifyToken)
    const html = getVerifyEmailHtml({email,token:verifyToken})

    await sendMail({email,subject,html});

    await redisClient.set(reatLimitKey,"true",{EX:60});

    res.json({
        message:"If your email is valid, averification like has been sent. it will expire in 5 minutes"
    })
})

export const verifyUser = TryCatch(async(req,res)=>{
    const {token} = req.params;
    if(!token){
        return res.status(400).json({
            message:"Verification token is requere",
        });
    }

    const verifyKey = `verify:${token}`;

    const userDataJson = await redisClient.get(verifyKey)

    if(!userDataJson){
         return res.status(400).json({
            message:"Verification Link is Expireed",
        });
    }
    await redisClient.del(verifyKey);

    const userData = JSON.parse(userDataJson);

    const existingUser = await User.findOne({email:userData.email})

    if(existingUser){
        return res.status(400).json({
            message:"User Already exists"
        });
    };

    const newUser = await User.create({
        name:userData.name,
        email:userData.email,
        password:userData.password
    });

    res.status(201).json({
        message:"Email verified successfully! your account has been created",
        user:{_id:newUser._id,name:newUser.name,email:newUser.email}
    })

})

