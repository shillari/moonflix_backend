const express = require('express'),
    morgan = require('morgan'),
    fs = require('fs'),
    uuid = require('uuid'),
    bodyParser = require('body-parser'),
    swaggerUi = require('swagger-ui-express'),
    swaggerSpec = require('./swagger');


const app = express();

let users = [
    {
        id: 'd0ab73e2-81e6-4aa5-81a8-512c8e4b7cf1',
        name: 'Alice',
        favoriteMovies: [],
    },
    {
        id: 'fd7cbf90-d6a3-4986-bb33-d888a8b73164',
        name: 'Bob',
        favoriteMovies: [{
            title: "Inception"
        }],
    },
    {
        id: '1d249e8a-c953-41b4-9146-d93a7e46aef0',
        name: 'Charlie',
        favoriteMovies: [],
    },
    {
        id: '537d9c53-3fbf-4a5a-8f7e-4901c07ec28c',
        name: 'David',
        favoriteMovies: [],
    },
    {
        id: '7f4d3fe1-50ab-4341-8652-bdbbabb396e7',
        name: 'Eva',
        favoriteMovies: [],
    },
];

const movies = [
    {
        title: 'Inception',
        description:
            'A thief who enters the dreams of others to steal their secrets.',
        genre: {
            name: 'Science Fiction',
            description:
                'Fictional science that explores the possibilities of the future.',
        },
        director: {
            name: 'Christopher Nolan',
            bio: 'Christopher Nolan is a British-American film director, screenwriter, and producer. He is known for his distinctive filmmaking style and intricate, non-linear storytelling.',
            birth_year: 1970,
        },
        imgURL: 'https://example.com/inception.jpg',
        featured: true,
    },
    {
        title: 'The Shawshank Redemption',
        description:
            'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
        genre: {
            name: 'Drama',
            description:
                'A genre of narrative fiction intended to be more serious than humorous in tone.',
        },
        director: {
            name: 'Frank Darabont',
            bio: 'Frank Darabont is a Hungarian-American film director, screenwriter, and producer. He is best known for directing the films The Shawshank Redemption, The Green Mile, and The Mist.',
            birth_year: 1959,
        },
        imgURL: 'https://example.com/shawshank.jpg',
        featured: true,
    },
    {
        title: 'The Dark Knight',
        description:
            'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        genre: {
            name: 'Action',
            description:
                'A genre of fiction in which protagonists face off against antagonists in a series of challenges, often involving violence, physical feats, and high-speed chases.',
        },
        director: {
            name: 'Christopher Nolan',
            bio: 'Christopher Nolan is a British-American film director, screenwriter, and producer. He is known for his distinctive filmmaking style and intricate, non-linear storytelling.',
            birth_year: 1970,
        },
        imgURL: 'https://example.com/darkknight.jpg',
        featured: true,
    },
    {
        title: 'The Purge',
        description:
            'In a dystopian America, a totalitarian political party enacts a 12-hour period during which all crime is legal, including murder.',
        genre: {
            name: 'Horror',
            description:
                'A genre of fiction that intends to scare or unsettle its audience through various means, often by creating an atmosphere of suspense, terror, or dread.',
        },
        director: {
            name: 'James DeMonaco',
            bio: 'James DeMonaco is an American filmmaker, best known for creating and directing The Purge film series.',
            birth_year: 1969,
        },
        imgURL: 'https://example.com/thepurge.jpg',
        featured: false,
    },
    {
        title: 'Pulp Fiction',
        description:
            "The lives of two mob hitmen, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
        genre: {
            name: 'Crime',
            description:
                'A genre that revolves around the actions of criminals, particularly violent crimes such as robbery, assault, and murder.',
        },
        director: {
            name: 'Quentin Tarantino',
            bio: 'Quentin Tarantino is an American film director, screenwriter, producer, and actor. He is widely regarded as one of the greatest filmmakers of his generation.',
            birth_year: 1963,
        },
        imgURL: 'https://example.com/pulpfiction.jpg',
        featured: false,
    },
];

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(
    morgan('combined', {
        stream: fs.createWriteStream(__dirname + '/logs/data.log', {
            flags: 'a',
        }),
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
 */
app.get('/movies', (req, res) => {
    res.status(200).json(movies);
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

app.get('/movies/:title', (req, res) => {
    const { title } = req.params;
    const movie = movies.find((movie) => movie.title === title);

    if (movie) {
        res.status(200).json(movie);
    } else {
        res.status(404).send('Movie not found.');
    }
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
 *       404:
 *         description: Genre not found
 */
app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find((movie) => movie.genre.name === genreName).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(404).send('Movie not found.');
    }
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
 *       404:
 *         description: Director not found
 */
app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(
        (movie) => movie.director.name === directorName
    ).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(404).send('Director not found.');
    }
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
 *               name:
 *                 type: string
 *             example:
 *               name: John Doe
 *               favoriteMovies: []
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Name cannot be empty
 */
app.post('/users', (req, res) => {
    let newUser = req.body;

    if(newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Name cannot be empty.');
    }
});

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: John Doe
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
app.put('/users/:id', (req, res) => {
    const {id} = req.params;
    const userBody = req.body;
    let user = users.find(user => user.id === id);

    if(user) {
        user.name = userBody.name;
        res.status(200).json(user);
    } else {
        res.status(404).send("User not found.");
    }
});

/**
 * @swagger
 * /users/{id}/{movieTitle}:
 *   post:
 *     summary: Add a movie to a user's favorite list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: movieTitle
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the movie to add
 *     responses:
 *       200:
 *         description: Movie added to user's favorite list
 *       404:
 *         description: User or movie not found
 */
app.post('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} = req.params;
    let user = users.find(user => user.id === id);
    const movie = movies.find(movie => movie.title === movieTitle);

    if(user) {
        if(movie) {
            user.favoriteMovies.push(movieTitle);
            res.status(200).send('Movie added.');
        } else {
            res.status(404).send('Movie does not exist.');
        }
    } else {
        res.status(404).send('User not found.');
    }
});

/**
 * @swagger
 * /users/{id}/{movieTitle}:
 *   delete:
 *     summary: Remove a movie from a user's favorite list
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *       - in: path
 *         name: movieTitle
 *         required: true
 *         schema:
 *           type: string
 *         description: The title of the movie to remove
 *     responses:
 *       200:
 *         description: Movie removed from user's favorite list
 *       404:
 *         description: User or movie not found
 */
app.delete('/users/:id/:movieTitle', (req, res) => {
    const {id, movieTitle} = req.params;
    let user = users.find(user => user.id === id);

    if(user) {
        user.favoriteMovies = user.favoriteMovies.filter(movie => movie.title !== movieTitle);
        res.status(200).send('Movie has been removed.');
    } else {
        res.status(404).send('User not found.');
    }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
app.delete('/users/:id', (req, res) => {
    const {id} = req.params;
    let user = users.find(user => user.id === id);

    if(user) {
        users = users.filter(user => user.id !== id);
        res.status(200).send('User has been deleted.');
    } else {
        res.status(404).send('User not found.');
    }
});

app.listen(8080, () => {
    console.log('The app is listening on port 8080.');
});
