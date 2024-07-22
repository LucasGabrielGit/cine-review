import fastify from "fastify";
import { fastifyCors } from "@fastify/cors"
import { UserController } from "./controllers/UserController";
import { MovieSeriesController } from "./controllers/MovieSeriesController";
import { ReviewController } from "./controllers/ReviewsController";
import { FollowerController } from "./controllers/FollowerController";
import { ensureAuthenticate } from "./middlewares/ensureAuthenticate";

const app = fastify()

//Classes
const userController = new UserController()
const movieSeriesController = new MovieSeriesController()
const reviewController = new ReviewController()
const followerController = new FollowerController()

app.register(fastifyCors, {
  origin: "*"
})
// User controllers routes
app.post('/user', userController.create)
app.get('/users', { preHandler: ensureAuthenticate }, userController.list)
app.get('/user/:id', { preHandler: ensureAuthenticate }, userController.findById)
app.put('/user/:id', { preHandler: ensureAuthenticate }, userController.update)
app.delete('/user/:id', { preHandler: ensureAuthenticate }, userController.delete)
app.post('/user/login', userController.login)

// Movie and Series controllers routes
app.post('/movie-series', { preHandler: ensureAuthenticate }, movieSeriesController.create)
app.get('/movie-series/findAll', { preHandler: ensureAuthenticate }, movieSeriesController.list)
app.get('/movie-series/:id', { preHandler: ensureAuthenticate }, movieSeriesController.findById)
app.put('/movie-series/:id', { preHandler: ensureAuthenticate }, movieSeriesController.update)
app.delete('/movie-series/:id', { preHandler: ensureAuthenticate }, movieSeriesController.delete)

// Reviews controllers routes
app.post('/review', { preHandler: ensureAuthenticate }, reviewController.create)
app.get('/reviews/movie-series/:movie_series_id', { preHandler: ensureAuthenticate }, reviewController.findByMovie)

// Follower controllers routes
app.post('/follower', { preHandler: ensureAuthenticate }, followerController.followUser)
app.get('/followers/:user_id', { preHandler: ensureAuthenticate }, followerController.getFollowers)

app.listen({ port: 3000 || process.env.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})