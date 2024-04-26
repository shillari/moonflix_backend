const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    swaggerUi = require('swagger-ui-express'),
    swaggerSpec = require('./config/swagger'),
    mongoose = require('mongoose'),
    Models = require('./models/models'),
    { check, validationResult } = require('express-validator');

const app = express();
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect(process.env.CONNECTION_URI);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
    morgan('combined', {
        stream: fs.createWriteStream(__dirname + '/logs/data.log', {
            flags: 'a',
        }),
    })
);

let auth = require('./config/auth')(app);
const passport = require('passport');
require('./config/passport');
const cors = require('cors');
let allowedOrigins = ['http://localhost:8080'];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                // If a specific origin isn’t found on the list of allowed origins
                let message =
                    'The CORS policy for this application doesn’t allow access from origin ' +
                    origin;
                return callback(new Error(message), false);
            }
            return callback(null, true);
        },
    })
);

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
app.get(
    '/movies',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.find()
            .then((movies) => {
                res.status(200).json(movies);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

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

app.get(
    '/movies/:title',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ title: req.params.title })
            .then((movie) => {
                res.status(200).json(movie);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

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
app.get(
    '/movies/genre/:genreName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ 'genre.name': req.params.genreName })
            .then((movie) => {
                res.status(200).json(movie.genre);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

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
app.get(
    '/movies/directors/:directorName',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Movies.findOne({ 'director.name': req.params.directorName })
            .then((movie) => {
                res.status(200).json(movie.director);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

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
 *       400:
 *         description: username already exists.
 *                      email already exists.
 *       500:
 *         description: Username cannot be empty
 *                      email cannot be empty
 *                      password cannot be empty
 */
app.post(
    '/users',
    // Validation logic here for request
    [
        check('username', 'Username is required. Min: 5 characteres.').isLength({ min: 5 }),
        check('username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('password', 'Password is required').not().isEmpty(),
        check('password', 'Password must contains at least 8 characteres.').isLength({ min: 8 }),
        check('email', 'Email does not appear to be valid').isEmail(),
    ],
    async (req, res) => {
        // check the validation object for errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        let hashedPassword = Users.hashPassword(req.body.password);
        await Users.findOne({ username: req.body.username })
            .then((user) => {
                if (user) {
                    return res
                        .status(400)
                        .send(req.body.username + ' already exists.');
                } else {
                    Users.create({
                        username: req.body.username,
                        password: hashedPassword,
                        email: req.body.email,
                        birthday: req.body.birthday,
                    })
                    .then((user) => {
                        // Exclude the password field from the response
                        const userWithoutPassword = user.toObject();
                        delete userWithoutPassword.password;
                        res.status(201).json(userWithoutPassword);
                    })
                    .catch((error) => {
                        console.error(error);
                        // Define a custom error handling middleware for handling duplicate email errors.
                        // Duplicate username is handle in the function 'findOne'.
                        if(error.name === 'MongoServerError' && error.code === 11000) {
                            res.status(400).send('Email address is already in use.');
                        } else {
                            res.status(500).send('Error: ' + error);
                        }
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

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
app.get(
    '/users',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        await Users.find()
            // Prevent the 'password' field from returning.
            .select('-password')
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    }
);

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
app.get('/users/:username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ username: req.params.username })
        // Prevent the 'password' field from returning.
        .select('-password')
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
app.put('/users/:username',
    // Validation logic here for request
    [
        check('username', 'Username is required. Min: 5 characteres.').isLength(
            { min: 5 }
        ),
        check(
            'username',
            'Username contains non alphanumeric characters - not allowed.'
        ).isAlphanumeric(),
        check('email', 'Email does not appear to be valid').isEmail(),
        check(
            'birthday',
            'Birthday must be a valid date in the format YYYY-MM-DD'
        )
            .optional()
            .isISO8601(), // Add date validation for birthday field
    ],  passport.authenticate('jwt', { session: false }), async (req, res) => {
    // Checks if the logged user is trying to update someone else's info.
    if (req.user.username !== req.params.username) {
        return res.status(403).send('Permission denied');
    }

    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    await Users.findOneAndUpdate({ username: req.params.username }, {
            $set: {
                username: req.body.username,
                email: req.body.email,
                birthday: req.body.birthday,
            },
        },{ new: true })
        // Prevent the 'password' field from returning.
        .select('-password')
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
app.post('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    // Checks if the logged user is trying to update someone else's info.
    if (req.user.username !== req.params.username) {
        return res.status(403).send('Permission denied');
    }

    await Users.findOneAndUpdate({ username: req.params.username }, {
            $push: { favoriteMovies: req.params.movieId },
        }, { new: true })
        // Prevent the 'password' field from returning.
        .select('-password')
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
app.delete('/users/:username/movies/:movieId', passport.authenticate('jwt', { session: false }),
    async (req, res) => {
    // Checks if the logged user is trying to update someone else's info.
    if (req.user.username !== req.params.username) {
        return res.status(403).send('Permission denied');
    }

    await Users.findOneAndUpdate({ username: req.params.username }, {
            $pull: { favoriteMovies: req.params.movieId },
        }, { new: true })
        // Prevent the 'password' field from returning.
        .select('-password')
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
app.delete(
    '/users/:username',
    passport.authenticate('jwt', { session: false }),
    async (req, res) => {
        // Checks if the logged user is trying to delete someone else.
        if (req.user.username !== req.params.username) {
            return res.status(403).send('Permission denied');
        }

        await Users.findOneAndDelete({ username: req.params.username })
            .then((user) => {
                if (!user) {
                    res.status(400).send(
                        req.params.username + ' was not found'
                    );
                } else {
                    res.status(200).send(req.params.username + ' was deleted.');
                }
            })
            .catch((err) => {
                console.error(err);
                res.status(500).send('Error: ' + err);
            });
    }
);

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
