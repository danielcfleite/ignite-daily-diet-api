import { FastifyReply, FastifyRequest } from "fastify"

export async function checkTokenMockUpExists(request: FastifyRequest, reply: FastifyReply){
    const tokenMockUp = request.cookies.tokenMockUp

    if(!tokenMockUp){
        return reply.status(401).send({
            error: "Unauthorized."
        })
    }else {
        return tokenMockUp
    }
}