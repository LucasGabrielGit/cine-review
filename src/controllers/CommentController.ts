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

  async delete(req: FastifyRequest, res: FastifyReply) {
    try {
      const { id } = req.params as { id: string }
      if (await prisma.comment.findUnique({
        where: {
          comment_id: id
        }
      })) {
        await prisma.comment.delete({
          where: {
            comment_id: id
          }
        }).then(() => {
          return res.status(200).send({
            message: "Comment deleted successfully"
          })
        }).catch((err) => {
          return res.status(500).send({
            message: err.message
          })
        })
      } else {
        return res.status(404)
      }
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async update(req: FastifyRequest, res: FastifyReply) {
    try {
      const { id } = req.params as { id: string }
      const data = req.body as Comment
      if (await prisma.comment.findUnique({
        where: {
          comment_id: id
        }
      })) {
        await prisma.comment.update({
          where: {
            comment_id: id
          },
          data
        }).then(() => {
          return res.status(200).send({
            message: "Comment updated successfully"
          })
        }).catch((err) => {
          return res.status(500).send({
            message: err.message
          })
        })
      } else {
        return res.status(404)
      }
    } catch (error: any) {

    }
  }

}