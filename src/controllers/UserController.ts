import type { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../client/prisma";
import type { User } from "@prisma/client";
import { compareSync, hashSync } from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"

export class UserController {
  async create(req: FastifyRequest, res: FastifyReply) {
    try {
      const data = req.body as User
      const hashedPassword = hashSync(data.password, 8)
      if (!await prisma.user.findUnique({
        where: {
          email: data.email
        }
      })) {
        await prisma.user.create({
          data: {
            ...data, password: hashedPassword
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
          reviews: true,
          favorites: true,
          watchlist: {
            select:
            {
              movie_series: {
                select: {
                  title: true,
                  poster_url: true,
                  type: true,
                  genre: {
                    select: {
                      name: true
                    }
                  },
                }
              }
            }
          }
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

      if ((username !== '' || name !== '')) {
        users = await prisma.user.findMany({
          where: {
            username: { contains: username },
            name: { contains: name }
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
      const { email, password } = req.body as {
        email?: string, username?: string, password: string
      }
      const user = await prisma.user.findFirst({
        where: {
          email
        },
        select: {
          user_id: true,
          bio: true,
          email: true,
          profile_image: true,
          password: true,
          username: true,
          name: true,
          surname: true,
          favorites: true,
          followers: {
            select: {
              followed_user: {
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

      const comparedPassword = compareSync(password, user.password)

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
        token, user: {
          user_id: user.user_id,
          name: user.name,
          surname: user.surname,
          username: user.username,
          email: user.email,
          profile_image: user.profile_image,
          bio: user.bio,
          favorites: user.favorites,
          followers: user.followers,
          following: user.following,
          reviews: user.reviews,
          watchlist: user.watchlist,
        }
      })
    } catch (err: any) {
      return res.status(500).send({
        message: err.message
      })
    }
  }

  async forgotPassword(req: FastifyRequest, res: FastifyReply) {
    try {
      const { email } = req.body as { email: string }

      const user = await prisma.user.findUnique({
        where: {
          email
        }
      })

      if (!user) {
        return res.status(404).send({
          message: "User not found"
        })
      }

      const resetToken = jwt.sign({ email }, String(process.env.JWT_SECRET_TOKEN), {
        expiresIn: "1h",
      })
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: String(process.env.EMAIL),
          pass: String(process.env.EMAIL_PASSWORD)
        }
      })
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Redefinir senha",
        html: `
          <p>Para redefinir sua senha, clique no seguinte link:</p>
          <a href="http://localhost:5173/reset-password?token=${resetToken}">Redefinir senha</a></br>
          <p>Se não solicitou esta alteração, ignore esta mensagem.</p>`
      }

      await transporter.sendMail(mailOptions)

      res.send({ message: "Email sent", token: resetToken })
    } catch (error: any) {
      return res.status(500).send({
        message: error.message
      })
    }
  }

  async resetPassword(req: FastifyRequest, res: FastifyReply) {
    try {
      const { token, password } = req.body as { token: string, password: string }

      const decoded = jwt.verify(token, String(process.env.JWT_SECRET_TOKEN)) as { email: string }

      if (typeof decoded === 'string' || !decoded.email) {
        return res.status(400).send({
          message: 'Invalid token.'
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          email: decoded.email
        }
      })

      if (!user) {
        return res.status(404).send({ message: "User not found" })
      }

      const comparePassword = compareSync(password, user.password)

      if (comparePassword) {
        return res.status(400).send({
          message: 'A senha não pode ser igual a anterior.'
        })
      }

      if (user.resetPasswordUsed && user.resetPasswordToken === token) {
        return res.status(400).send({
          message: 'This token has already been used to reset the password.'
        });
      }

      const hashedPassword = hashSync(password, 8)
      await prisma.user.update({
        where: {
          email: decoded.email,
        },
        data: {
          password: hashedPassword,
          resetPasswordToken: token,
          resetPasswordUsed: true
        }
      })
      res.send({ message: "Password updated" })
    } catch (error: any) {
      return res.status(500).send({ message: error.message })
    }
  }
}
