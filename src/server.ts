import fastify from "fastify";
import { fastifyCors } from "@fastify/cors"
import { UserController } from "./controllers/UserController";
import { MovieSeriesController } from "./controllers/MovieSeriesController";
import { ReviewController } from "./controllers/ReviewsController";
import { FollowerController } from "./controllers/FollowerController";
import { ensureAuthenticate } from "./middlewares/ensureAuthenticate";
import { CommentController } from "./controllers/CommentController";
import { FavoritesController } from "./controllers/FavoritesController";

const app = fastify()

//Classes
const userController = new UserController()
const movieSeriesController = new MovieSeriesController()
const reviewController = new ReviewController()
const followerController = new FollowerController()
const commentController = new CommentController()
const favoriteController = new FavoritesController()

app.register(fastifyCors, {
  origin: "*"
})
// User controllers routes
app.post('/user', userController.create)
app.post('/users', { preHandler: ensureAuthenticate }, userController.list)
app.get('/user/:id', { preHandler: ensureAuthenticate }, userController.findById)
app.put('/user/:id', { preHandler: ensureAuthenticate }, userController.update)
app.delete('/user/:id', { preHandler: ensureAuthenticate }, userController.delete)
app.post('/user/login', userController.login)
app.post('/user/forgot-password', userController.forgotPassword)
app.put('/user/reset-password', userController.resetPassword)

// Movie and Series controllers routes
app.post('/movie-series', { preHandler: ensureAuthenticate }, movieSeriesController.create)
app.get('/movie-series/findAll', { preHandler: ensureAuthenticate }, movieSeriesController.list)
app.get('/movie-series/:id', { preHandler: ensureAuthenticate }, movieSeriesController.findById)
app.delete('/movie-series/:id', { preHandler: ensureAuthenticate }, movieSeriesController.delete)
app.post('/movie-series/watchlist', { preHandler: ensureAuthenticate }, movieSeriesController.addToWatchList)

// Reviews controllers routes
app.post('/review', { preHandler: ensureAuthenticate }, reviewController.create)
app.get('/reviews/movie-series/:movie_series_id', { preHandler: ensureAuthenticate }, reviewController.findByMovie)

// Follower controllers routes
app.post('/follower', { preHandler: ensureAuthenticate }, followerController.followUser)
app.get('/followers/:user_id', { preHandler: ensureAuthenticate }, followerController.getFollowers)

// Comment controller routes
app.post('/comment', { preHandler: ensureAuthenticate }, commentController.create)
app.delete('/comment/:id', { preHandler: ensureAuthenticate }, commentController.delete)
app.put('/comment/:id', { preHandler: ensureAuthenticate }, commentController.update)

// Favorite controller routes
app.post('/favorite', { preHandler: ensureAuthenticate }, favoriteController.addToFavorites)
app.get('/favorites/:user_id', { preHandler: ensureAuthenticate }, favoriteController.getFavorites)

// Start server
app.listen({ port: 3000 || process.env.PORT, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})