import z, { email } from "zod";

export const registerSchema = z.object({
    name:z.string().min(3,"Name Must be at least 3 char log"),
    email:z.string().email('must be email'),
    password:z.string().min(6,"must be 6 letter")
})