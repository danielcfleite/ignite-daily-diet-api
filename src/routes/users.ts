import { FastifyInstance } from "fastify"
import {z} from 'zod'
import { knexServer } from "../database"
import { randomUUID } from "crypto"
import {compareSync, hashSync} from 'bcrypt'

export async function usersRoutes(app: FastifyInstance){
    app.addHook('preHandler', async(request, reply)=>{
        console.log(`[${request.method} ] ${request.url}`)
    })
    
    app.get("/admin", {
    } ,async(request, reply) =>{
        const users = await knexServer('users').select('*')

        const userQuantity = await knexServer('users').count('* as number_of_users')

        return {userQuantity ,users}
    })
    
    app.post('/login', async(request, reply)=>{

        const creatUserLogInSchema = z.object({
            email: z.string(),
            password: z.string()
    }) 

    const {  email, password } = creatUserLogInSchema.parse(request.body)

    const userExists = await knexServer('users').where( {email} ).first() 
    if (userExists){
    const passwordChecks = compareSync(password, userExists.password)

       const secretKey="thisIsJustATest"

    if(passwordChecks){
        const user = {email: userExists.email, id: userExists.id}
        reply.setCookie("tokenMockUp", user.id ,{
            path: '/',
        })
    } else{
        throw Error ('your password is incorrect')
    }
} else {
    throw Error ('email not found')
}
})
    


    app.post("/register", async(request, reply) =>{
    
       const creatUserBodySchema = z.object({
            name : z.string(),
            email: z.string(),
            password: z.string(),
    }) 
        const { name, email, password } = creatUserBodySchema.parse(request.body)
        
        const emailExists = await knexServer('users').where( {email} ).first()

        if(emailExists){
            throw Error ('email already in use')
        }

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = hashSync(email, 10)
      
            reply.setCookie('sessionId', sessionId, {
              path: '/',
              maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
            })
          } 

    const encryptedPassword = hashSync(password,10)

    await knexServer('users').insert({
        id: crypto.randomUUID(),
        name, 
        email,
        password : encryptedPassword
        
    })

    
})   
app.get('/summary', async (request, reply)=>{
   const token = request.cookies.tokenMockUp

   const meals = await knexServer('meals').where({user_id:token})
   const mealsQuantity = await knexServer('meals').where({user_id:token}).count('* as number_of_meals')
   const numberOfMealsInDiet = await knexServer('meals').where({user_id:token, is_on_diet:true}).count('* as meals_in_diet')
   const numberOfMealsOutsideDiet = await knexServer('meals').where({user_id:token, is_on_diet:false}).count('* as meals_not_in_diet')
   const NumberOfMealsInDietByTimeStamp=  await knexServer('meals').where({user_id:token, is_on_diet:true}).orderBy('created_at')
   async function countConsecutiveMealsInDiet (meals) {
    let consecutiveCount = 0 
    let maxConsecutiveCount = 0
    
    meals.forEach((meal) => {
        if (meal.is_on_diet === 1){
            consecutiveCount ++;
            maxConsecutiveCount = Math.max(consecutiveCount, maxConsecutiveCount);
        } else{
            consecutiveCount = 0
        }
    });{
        
    }
    return(maxConsecutiveCount)
   }
   const bestConsecutiveCount = await countConsecutiveMealsInDiet(meals)
   
      reply.send({meals, mealsQuantity, numberOfMealsInDiet, numberOfMealsOutsideDiet, bestConsecutiveCount})
}
)
}