const express = require('express'),
    morgan = require('morgan');

const app = express();

const movies = [
    {
        title: '50 first dates',
        release_date: {
            year: '2004',
            month: '02',
            day: '13',
        },
    },
    {
        title: 'The Maze Runner',
        release_date: {
            year: '2014',
            month: '09',
            day: '19',
        },
    },
    {
        title: 'The Hunger Games',
        release_date: {
            year: '2012',
            month: '03',
            day: '22',
        },
    },
    {
        title: 'Edge of Tomorrow',
        release_date: {
            year: '2014',
            month: '05',
            day: '29',
        },
    },
    {
        title: 'The Exterminator',
        release_date: {
            year: '1980',
            month: '09',
            day: '10',
        },
    },
    {
        title: 'Mission: Impossible',
        release_date: {
            year: '1996',
            month: '08',
            day: '07',
        },
    },
    {
        title: 'The Mummy',
        release_date: {
            year: '1999',
            month: '06',
            day: '03',
        },
    },
    {
        title: 'Train to Busan',
        release_date: {
            year: '2016',
            month: '12',
            day: '02',
        },
    },
    {
        title: 'World War Z',
        release_date: {
            year: '2013',
            month: '06',
            day: '27',
        },
    },
    {
        title: 'I Am Legend',
        release_date: {
            year: '2008',
            month: '01',
            day: '10',
        },
    },
];

app.use(express.static('public'));

app.use(morgan('common'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something is wrong!');
});

app.get('/', (req, res) => {
    res.send('Welcome');
});

app.get('/movies', (req, res) => {
    res.json(movies);
});

app.listen(8080, () => {
    console.log('The app is listening on port 8080.');
});
