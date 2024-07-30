import type { MovieSeries, Watchlist } from "@prisma/client";
import type { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../client/prisma";

export class MovieSeriesController {
  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const { data, genres } = req.body as { data: MovieSeries, genres: string[] }
      const movieAlreadyExists = await prisma.movieSeries.findFirst({
        where: {
          title: data.title
        }, include: {
          genre: true
        }
      })

      const genresExists = await prisma.genre.findMany({
        where: {
          name: {
            in: genres.map((genre: any) => genre.name)
          }
        }
      })

      const genreIds = genresExists.map((genre: any) => genre.genre_id)

      if (!movieAlreadyExists) {
        await prisma.movieSeries.create({
          data: {
            ...data, genre: {
              connect: genreIds.map((genreId: any) => ({ genre_id: genreId })),
              create: genres
                .filter((genre: any) => !genreIds.includes(genre.genre_id))
                .map((genre: any) => ({
                  name: genre.name
                }))

            }
          }, include: {
            genre: true
          }
        }).then(() => {
          return res.status(201).send({
            message: "Movie created successfully",
            data
          })
        }).catch((err) => {
          return res.status(500).send({
            message: err.message
          })
        })
      }
      await prisma.movieSeries.update({
        where: {
          id: movieAlreadyExists?.id
        },
        data: {
          ...data, genre: {
            connect: genresExists.map((genre: any) => ({ genre_id: genre.genre_id }))
          }
        },
        include: {
          genre: true
        }
      }).then(() => {
        return res.status(201).send({
          message: "Movie updated successfully",
          data
        })
      })
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

  async delete(req: FastifyRequest, res: FastifyReply) { }

  async addToWatchList(req: FastifyRequest, res: FastifyReply) {
    try {
      const { movie_series_id, user_id } = req.body as Watchlist

      const checkWatchList = await prisma.watchlist.findFirst({
        where: {
          movie_series_id,
          user_id
        }
      })

      // se o filme ou serie ja foi favoritado, remove o favorito
      if (checkWatchList) {
        await prisma.watchlist.delete({
          where: {
            watchlist_id: checkWatchList.watchlist_id
          }
        })
      } else {
        await prisma.watchlist.create({
          data: {
            movie_series_id,
            user_id
          }
        }).then(() => {

          return res.status(200).send({
            message: "Movie added to watchlist successfully"
          })
        }).catch((err) => {
          return res.status(500).send({
            message: err.message
          })
        })
      }
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }
}