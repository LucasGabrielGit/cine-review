import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";

export class FollowerController {
  // Seguir um usuário
  async followUser(req: FastifyRequest, res: FastifyReply) {
    // Implementação da lógica para seguir um usuário
    try {
      const { user_id, follower_id } = req.body as { user_id: string, follower_id: string }

      if (user_id === follower_id) {
        return res.status(400).send({ message: "You cannot follow yourself" });
      }

      const existingFollow = await prisma.follower.findFirst({
        where: {
          user_id: follower_id,
          followed_user_id: user_id
        }
      });

      if (existingFollow) {
        await prisma.follower.deleteMany({
          where: {
            user_id: follower_id,
            followed_user_id: user_id
          }
        });
        return res.status(200).send({ message: "Unfollowed successfully" });
      }

      // Seguir o usuário
      await prisma.follower.create({
        data: {
          user_id: follower_id,
          followed_user_id: user_id
        }
      })
      return res.status(200).send({ message: "Followed successfully" })

    } catch (error: any) {
      return res.status(500).send({ message: error.message })
    }
  }

  // Deixar de seguir um usuário
  async unfollowUser(req: FastifyRequest, res: FastifyReply) {
    // Implementação da lógica para deixar de seguir um usuário
  }

  // Obter a lista de seguidores de um usuário
  async getFollowers(req: FastifyRequest, res: FastifyReply) {
    try {
      const { user_id } = req.params as { user_id: string }
      const followers = await prisma.follower.findMany({
        where: {
          user_id
        },
        select: {
          user: {
            select: {
              profile_image: true,
              username: true,
              user_id: true
            }
          }
        }
      })
      if (followers.length == 0) {
        return res.status(404).send({ message: "No followers found" })
      }
      return res.status(200).send({ followers })
    } catch (error: any) {
      return res.status(500).send({ message: error.message })
    }
  }

  // Obter a lista de usuários que um usuário está seguindo
  async getFollowing(req: FastifyRequest, res: FastifyReply) {
    // Implementação da lógica para obter a lista de usuários que um usuário está seguindo
  }

  // Obter o número de seguidores de um usuário
  async getFollowerCount(req: FastifyRequest, res: FastifyReply) {
    // Implementação da lógica para obter o número de seguidores de um usuário
  }

  // Obter o número de usuários que um usuário está seguindo
  async getFollowingCount(req: FastifyRequest, res: FastifyReply) {
    // Implementação da lógica para obter o número de usuários que um usuário está seguindo
  }
}
