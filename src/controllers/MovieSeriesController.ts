import type { MovieSeries } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";

export class MovieSeriesController {
  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const { data, genre_id } = req.body as { data: MovieSeries, genre_id: string[] }
      const movieAlreadyExists = await prisma.movieSeries.findFirst({
        where: {
          title: data.title
        }, include: {
          genre: true
        }
      })

      const genres = await prisma.genre.findMany({
        where: {
          genre_id: {
            in: genre_id.map((genre: any) => genre.id)
          }
        }
      })

      console.log(genres)

      // if (!movieAlreadyExists) {
      //   await prisma.movieSeries.create({
      //     data: {
      //       ...data, genre: {
      //         connect: genre_id.map((genre: any) => ({ genre_id: genre.id }))
      //       }
      //     }, include: {
      //       genre: true
      //     }
      //   }).then(() => {
      //     return res.status(201).send({
      //       message: "Movie created successfully",
      //       data
      //     })
      //   }).catch((err) => {
      //     return res.status(500).send({
      //       message: err.message
      //     })
      //   })
      // }
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }
  async findById(req: FastifyRequest, res: FastifyReply) {
    try {
      const { id } = req.params as { id: string }

      const movie = await prisma.movieSeries.findUnique({
        where: {
          id: id
        },
        include: {
          reviews: {
            select: {
              review_id: true,
              comment: true,
              created_at: true,
              user: {
                select: {
                  user_id: true,
                  username: true,
                  profile_image: true
                }
              },
              rating: true,
              comments: {
                select: {
                  comment_id: true,
                  content: true, user: {
                    select: {
                      user_id: true,
                      username: true,
                      profile_image: true
                    }
                  }
                }
              }
            },
          },
          genre: {
            select: {
              name: true
            }
          }
        }
      })

      if (!movie) {
        return res.status(404).send({
          message: "Movie not found"
        })
      }

      return res.status(200).send({ movie })
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }
  async list(req: FastifyRequest, res: FastifyReply) {
    try {
      const movies = await prisma.movieSeries.findMany({
        include: {
          reviews: {
            select: {
              comment: true,
              created_at: true,
              user: {
                select: {
                  username: true,
                  profile_image: true
                }
              },
              rating: true,
            }
          },
          genre: {
            select: {
              name: true
            }
          }
        }
      })

      if (movies.length == 0) {
        return res.status(404).send({ message: "No movies found" })
      }
      return res.status(200).send({ movies })
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }
  async update(req: FastifyRequest, res: FastifyReply) { }
  async delete(req: FastifyRequest, res: FastifyReply) { }
}