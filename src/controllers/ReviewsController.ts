import type { Review } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";

export class ReviewController {
  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = req.body as Review

      if (data !== undefined) {
        await prisma.review.create({
          data
        })
      }

      return res.status(201).send({
        message: "Review created successfully"
      })

    } catch (error: any) {

    }
  }

  async findByMovie(req: FastifyRequest, res: FastifyReply) {
    try {
      const { movie_series_id } = req.params as { movie_series_id: string }
      const reviews = await prisma.review.findMany({
        where: {
          movie_series_id
        },
        include: {
          user: { select: { followers: true, profile_image: true, username: true } },
        }
      })

      if (reviews.length == 0) {
        return res.status(404).send({ message: "No reviews found" })
      }

      return res.status(200).send({ reviews })
    } catch (error) {

    }
  }

  async findByUser(req: FastifyRequest, res: FastifyReply) { }

  async list(req: FastifyRequest, res: FastifyReply) { }

  async update(req: FastifyRequest, res: FastifyReply) { }

  async delete(req: FastifyRequest, res: FastifyReply) { }
}