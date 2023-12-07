import { FastifyInstance } from "fastify"
import {z} from 'zod'
import { knexServer } from "../database"
import { randomUUID } from "crypto"
import {compareSync, hashSync} from 'bcrypt'
import { checkTokenMockUpExists } from "../middlewares/check-token-exists"
import knex from "knex"
import { create } from "domain"

export async function mealsRoutes(app: FastifyInstance){
    app.addHook('preHandler', async(request, reply)=>{
        console.log(`[${request.method} ] ${request.url}`)
    })
    
    app.get("/admin", {
    } ,async(request, reply) =>{
        const meals = await knexServer('meals').select('*')

        return meals
    })
    
    app.get('/summary/', async(request, reply)=>{

        const tokenMockUp = await checkTokenMockUpExists(request,reply)

        const meals = knexServer('meals').where({user_id:tokenMockUp})

        return meals

})
    app.delete('/:id', async(request, reply)=>{

        const tokenMockUp = await checkTokenMockUpExists(request,reply)

        const createParamsSchema = z.object(
            {
                id: z.string().uuid()
            }
        )
    
        const {id} = createParamsSchema.parse(request.params)
        const meal = await knexServer('meals').where({id}).first()

            const createMealSchema = z.object({
                user_id: z.string().uuid()
            })

        if (createMealSchema.parse(meal).user_id !== tokenMockUp){
            throw Error ('you do not have acess to this item')
        }

        await knexServer('Meals').where({id}).delete()

})
    
    app.get('/:id', async(request, reply)=>{

        const tokenMockUp = await checkTokenMockUpExists(request,reply)

        const createParamsSchema = z.object(
            {
                id: z.string().uuid()
            }
        )
    
        const {id} = createParamsSchema.parse(request.params)

        const meal = await knexServer('Meals').where({id}).first()
        
        if(!meal){
            throw Error ('id not found')
        } 

        if (meal.user_id !== tokenMockUp){
            throw Error ('you do not have acess to this item')
        }

        return meal

})
    


    app.post("/", {preHandler: checkTokenMockUpExists}, async(request, reply) =>{
    
        const tokenMockUp = await checkTokenMockUpExists(request,reply) 

       const creatMealBodySchema = z.object({
            title : z.string(),
            description : z.string(),
            isOnDiet: z.boolean()

    }) 
        const { title, description, isOnDiet } = creatMealBodySchema.parse(request.body)
        console.log(title, description, isOnDiet)
        if (!title ||!description) {
            throw Error('all data must be sent')
        } else {
           await knexServer('Meals').insert(
                {
                    id: randomUUID(),
                    user_id: tokenMockUp,
                    title, 
                    description,
                    is_on_diet:isOnDiet
                }
            )
        } 
    
})   
app.put('/:id', async (request, reply)=>{
    const tokenMockUp = await checkTokenMockUpExists(request,reply) 

    const createParamsSchema = z.object(
        {
            id: z.string().uuid()
        }
    )

    const {id} = createParamsSchema.parse(request.params)
    const idExists = await knexServer('Meals').where({id}).first()

    if(!idExists){
        throw Error ('meal not found')
    }

    if(idExists.user_id !== tokenMockUp ){
        throw Error ('you do not have acess to this item')
    }

    const creatMealBodySchema = z.object({
        title : z.string().optional(),
        description : z.string().optional(),
        isOnDiet: z.boolean().optional()
})
    const {title, description, isOnDiet} = creatMealBodySchema.parse(request.body)

    await knexServer('Meals').update({title, description, is_on_diet: isOnDiet}).where({id})
})


}