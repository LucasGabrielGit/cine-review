import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";
import type { Comment } from "@prisma/client";

export class CommentController {

  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = req.body as Comment
      if (data !== undefined) {
        await prisma.comment.create({
          data
        }).then(() => {
          return res.status(201).send({
            message: "Comment created successfully"
          })
        }).catch((err) => {
          return res.status(500).send({
            message: err.message
          })
        })
      }
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async delete(req: FastifyRequest, res: FastifyReply) { }

  async update(req: FastifyRequest, res: FastifyReply) { }

}