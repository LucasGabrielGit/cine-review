import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";

export class FavoritesController {
  async addToFavorites(req: FastifyRequest, res: FastifyReply) {
    try {
      const { user_id, movie_series_id } = req.body as { user_id: string, movie_series_id: string }

      // verifica se o filme ou serie ja foi favoritado pelo usuário
      const checkFavorite = await prisma.favorite.findFirst({
        where: {
          user_id,
          movie_series_id
        }
      })
      //se o filme ou serie ja foi favoritado, remove o favorito
      if (checkFavorite) {
        await prisma.favorite.deleteMany({
          where: {
            user_id,
            movie_series_id
          }
        })
        return res.status(200).send({ message: 'Removed from favorites' })
      }

      const favorite = await prisma.favorite.create({
        data: {
          user_id,
          movie_series_id
        }
      })
      return res.status(201).send(favorite)
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }

  async getFavorites(req: FastifyRequest, res: FastifyReply) {
    try {
      const { user_id } = req.params as { user_id: string }
      const favorites = await prisma.favorite.findMany({
        where: {
          user_id
        },
        include: {
          movie_series: {
            select: {
              id: true,
              title: true,
              description: true,
              genre: true,
            }
          }
        }
      })
      return res.status(200).send({ favorites })
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }
}