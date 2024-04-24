const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    uuid = require('uuid'),
    bodyParser = require('body-parser'),
    swaggerUi = require('swagger-ui-express'),
    swaggerSpec = require('./swagger'),
    mongoose = require('mongoose'),
    Models = require('./models');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/moonflixdb');

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('combined', {stream: fs.createWriteStream(__dirname + '/logs/data.log', {flags: 'a',}),}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Returns a list of movies
 *     responses:
 *       200:
 *         description: A list of movies
 *       500:
 *         description: Error description
 */
app.get('/movies', async (req, res) => {
    await Movies.find()
        .then((movies) => {
            res.status(200).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /movies/{title}:
 *   get:
 *     summary: Get a movie by title
 *     parameters:
 *       - in: path
 *         name: title
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the movie
 *     responses:
 *       200:
 *         description: The movie with the specified title
 *       404:
 *         description: Movie not found
 */

app.get('/movies/:title', async (req, res) => {
    await Movies.findOne({title: req.params.title})
        .then((movie) => {
            res.status(200).json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /movies/genre/{genreName}:
 *   get:
 *     summary: Get genre description
 *     parameters:
 *       - in: path
 *         name: genreName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the genre
 *     responses:
 *       200:
 *         description: Genre description
 *       500:
 *         description: Error description
 */
app.get('/movies/genre/:genreName', async (req, res) => {
    await Movies.findOne({'genre.name': req.params.genreName})
        .then((movie) => {
            res.status(200).json(movie.genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        })
});

/**
 * @swagger
 * /movies/directors/{directorName}:
 *   get:
 *     summary: Get director information
 *     parameters:
 *       - in: path
 *         name: directorName
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the director
 *     responses:
 *       200:
 *         description: Director description
 *       500:
 *         description: Error description
 */
app.get('/movies/directors/:directorName', async (req, res) => {
    await Movies.findOne({'director.name': req.params.directorName})
        .then((movie) => {
            res.status(200).json(movie.director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *               birthday:
 *                 type: date
 *             example:
 *               username: John Doe
 *               password: teste123
 *               email: john@email.com
 *               birthday: 1998-02-24
 *     responses:
 *       201:
 *         description: User created successfully
 *       500:
 *         description: Username cannot be empty
 *                      email cannot be empty
 *                      password cannot be empty
 */
app.post('/users', async (req, res) => {
    await Users.findOne({ username: req.body.username})
        .then((user) => {
            if(user) {
                return res.status(400).send(req.body.username + ' already exists.');
            } else {
                Users
                    .create({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        birthday: req.body.birthday
                    })
                    .then((user) => {res.status(201).json(user) })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send('Error: ' + error);
                });
            }
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns a list of users
 *     responses:
 *       200:
 *         description: A list of users
 *       500:
 *         description: Error description
 */
app.get('/users', async (req, res) => {
    await Users.find()
        .then((users) => {
            res.status(200).json(users);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
        });
});

/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Get user by username
 *     description: Retrieve a user by their username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: User retrieved successfully
 *       '500':
 *         description: Internal server error
 */
app.get('/users/:username', async (req, res) => {
    await Users.findOne({username: req.params.username})
        .then((user) => {
            res.status(200).json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         type: string
 *         description: The username of the user to update
 *         schema:
 *           type: string
 *       - in: body
 *         name: user
 *         required: true
 *         description: User information to update
 *         schema:
 *           type: object
 *           properties:
 *             username:
 *               type: string
 *               description: The new username
 *             password:
 *               type: string
 *               description: The user's new password
 *             email:
 *               type: string
 *               format: email
 *               description: The user's new email address
 *             birthday:
 *               type: string
 *               format: date
 *               description: The user's new birthday
 *     responses:
 *       200:
 *         description: User updated successfully
 *       500:
 *         description: Error description
 */
app.put('/users/:username', async (req, res) => {
    await Users.findOneAndUpdate({username: req.params.username},
    { $set: 
        {
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday
        }
    },
    { new: true})
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

/**
 * @swagger
 * /users/{username}/movies/{movieId}:
 *   post:
 *     summary: Add a movie to a user's favorite list
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the user
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The movie id
 *     responses:
 *       200:
 *         description: Movie added to user's favorite list
 *       500:
 *         description: Error description
 */
app.post('/users/:username/movies/:movieId', async (req, res) => {
    await Users.findOneAndUpdate({username: req.params.username},
        {
            $push: {favoriteMovies: req.params.movieId}
        },
        { new: true})
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /users/{username}/movies/{movieId}:
 *   delete:
 *     summary: Remove a movie from a user's favorite list
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the user
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the movie to remove
 *     responses:
 *       200:
 *         description: Movie removed from user's favorite list
 *       500:
 *         description: Error description
 */
app.delete('/users/:username/movies/:movieId', async (req, res) => {
    await Users.findOneAndUpdate({username: req.params.username},
        {
            $pull: {favoriteMovies: req.params.movieId}
        },
        { new: true})
        .then((updatedUser) => {
            res.json(updatedUser);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

/**
 * @swagger
 * /users/{username}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       500:
 *         description: Error description
 */
app.delete('/users/:username', async (req, res) => {
    await Users.findOneAndDelete({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + ' was not found');
        } else {
          res.status(200).send(req.params.username + ' was deleted.');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  });

app.listen(8080, () => {
    console.log('The app is listening on port 8080.');
});
