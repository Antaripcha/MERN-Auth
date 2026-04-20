import { registerSchema } from '../config/zod.js';
import TryCatch from '../middleware/TryCatch.js';
import sanitize from 'mongo-sanitize';

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
    res.json({
        name,
        email,
        password
    })
})