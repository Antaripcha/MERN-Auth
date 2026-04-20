import { registerUser } from "../controller/user.controller.js"

export const user = (app) => {
    app.get('/',(req,res)=>{
        res.send('Hello')
    })
    app.post('/api/v1/register',registerUser)
}