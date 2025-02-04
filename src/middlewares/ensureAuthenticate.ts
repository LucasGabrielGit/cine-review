import type { FastifyReply, FastifyRequest } from "fastify"
import jwt from "jsonwebtoken"

export async function ensureAuthenticate(
  req: FastifyRequest,
  res: FastifyReply,
) {
  const authToken = req.headers.authorization

  if (!authToken) {
    res.status(401).send({
      message: 'Token de autenticação não encontrado',
    })
    return
  }

  const [, token] = authToken.split(' ')

  try {
    const decoded = jwt.verify(token, String(process.env.JWT_SECRET_TOKEN))
    req.user = decoded
    return
  } catch (err) {
    return res.status(401).send({
      message: 'Token de autenticação inválido',
    })
  }
}