import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../client/prisma";
import type { User } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";

export class UserController {
  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = req.body as User
      const hashedPassword = hashSync(data.password_hash, 8)
      if (!await prisma.user.findUnique({
        where: {
          email: data.email
        }
      })) {
        await prisma.user.create({
          data: {
            ...data, password_hash: hashedPassword
          }
        })
        return res.status(201).send({
          message: "User created successfully"
        })
      } else {
        return res.status(409).send({
          message: "User already exists"
        })
      }
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async findById(req: FastifyRequest, res: FastifyReply) {
    try {
      const { id } = req.params as { id: string }

      const user = await prisma.user.findFirst({
        where: {
          user_id: id
        },
        include: {
          followers: {
            select: {
              followed_user: { // Informação do seguidor
                select: {
                  user_id: true,
                  profile_image: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          following: {
            select: {
              user: { // Informação do usuário seguido
                select: {
                  user_id: true,
                  profile_image: true,
                  username: true,
                  email: true
                }
              }
            }
          },
          reviews: true
        }
      })

      if (user === null) {
        return res.status(404).send({
          message: "User not found"
        })
      }

      return res.status(200).send({
        user
      })

    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async list(req: FastifyRequest, res: FastifyReply) {
    try {
      const { username, name } = req.body as { username: string, name: string }

      let users: any = []

      if ((username !== undefined || name !== undefined)) {
        users = await prisma.user.findMany({
          where: {
            username: { contains: username },
            name: { mode: "insensitive", contains: name },
          },
          select: {
            user_id: true,
            bio: true,
            email: true,
            profile_image: true,
            username: true,
            name: true,
            reviews: true,
            followers: {
              select: {
                followed_user: {
                  select: {
                    user_id: true,
                    username: true,
                    email: true,
                    profile_image: true,
                  }
                }
              }
            },
            comments: true,
            favorites: true,
            following: {
              select: {
                user: {
                  select: {
                    user_id: true,
                    username: true,
                    email: true,
                    profile_image: true,
                  }
                }
              }
            },
            watchlist: true
          }
        })
      } else {
        users = await prisma.user.findMany({
          select: {
            user_id: true,
            bio: true,
            email: true,
            profile_image: true,
            username: true,
            name: true,
            reviews: true,
            followers: {
              select: {
                followed_user: {
                  select: {
                    user_id: true,
                    username: true,
                    email: true,
                    profile_image: true,
                  }
                }
              }
            },
            comments: true,
            favorites: true,
            following: {
              select: {
                user: {
                  select: {
                    user_id: true,
                    username: true,
                    email: true,
                    profile_image: true,
                  }
                }
              }
            },
            watchlist: true
          }
        })
      }

      if (users.length == 0) {
        return res.status(404).send({ message: "No users found" })
      }

      return res.status(200).send({ users })

    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async update(req: FastifyRequest, res: FastifyReply) {
    try {
      const { id } = req.params as { id: string }
      const data = req.body as User
      if (await prisma.user.findFirst({
        where: {
          user_id: id
        }
      })) {
        await prisma.user.update({
          where: {
            user_id: id
          },
          data
        })
        return res.status(200).send({
          message: "User updated successfully"
        })
      } else {
        return res.status(404).send({
          message: "User not found"
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
      if (await prisma.user.findFirst({
        where: {
          user_id: id
        }
      })) {
        await prisma.user.delete({
          where: {
            user_id: id
          }
        })
        return res.status(200).send({
          message: "User deleted successfully"
        })
      } else {
        return res.status(404).send({
          message: "User not found"
        })
      }
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async login(req: FastifyRequest, res: FastifyReply) {
    try {
      const { email, username, password_hash } = req.body as {
        email?: string, username?: string, password_hash: string
      }
      const user = await prisma.user.findFirst({
        where: {
          email: email, OR: [
            { username }
          ]
        },
        select: {
          user_id: true,
          bio: true,
          email: true,
          profile_image: true,
          password_hash: true,
          username: true,
          favorites: true,
          followers: {
            select: {
              user: {
                select: {
                  email: true,
                  profile_image: true,
                  username: true,
                  followers: true,
                  following: true
                }
              }
            }
          },
          following: {
            select: {
              user: {
                select: {
                  email: true,
                  profile_image: true,
                  username: true,
                  followers: true,
                  following: true
                }
              }
            }
          },
          reviews: true,
          watchlist: true
        }
      })
      if (!user) {
        return res.status(404).send({
          message: "User not found"
        })
      }

      const comparedPassword = compareSync(password_hash, user.password_hash)

      if (!comparedPassword) {
        return res.status(401).send({
          message: "Invalid password"
        })
      }

      const token = jwt.sign({}, String(process.env.JWT_SECRET_TOKEN), {
        expiresIn: "1d",
        subject: user.user_id
      })


      return res.status(200).send({
        token, user
      })
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }
}