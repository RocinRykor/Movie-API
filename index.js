const express = require('express'),
    morgan = require('morgan');

const app = express();

app.use(express.static('public'));
app.use(morgan('common'));

let topMovie = [
    {
        id: 1,
        title: 'Abraham Lincoln: Vampire Hunter',
        actors: ['Benjamin Walker', 'Dominic Cooper'],
    },
    {
        id: 2,
        title: '300',
        actors: ['Gerard Butler', 'Michael Fassbender'],
    },
    {
        id: 3,
        title: 'Iron Man',
        actors: ['Robert Downey jr.', 'Jeff Bridges'],
    },
    {
        id: 4,
        title: 'The Imitation Game',
        actors: ['Benedict Cumberbatch', 'Keira Knightley'],
    },
    {
        id: 5,
        title: 'Sherlock Holmes: A Game of Shadows',
        actors: ['Benedict Cumberbatch', 'Jude Law'],
    },
    {
        id: 6,
        title: 'Doctor Strange',
        actors: ['Benedict Cumberbatch', 'Chiwetel Ejiofor'],
    },
    {
        id: 7,
        title: 'Black Panther',
        actors: ['Chadwick Boseman', 'Michael B. Jordan'],
    },
    {
        id: 8,
        title: 'John Wick',
        actors: ['Keanu Reeves', 'Michael Nyqvist'],
    },
    {
        id: 9,
        title: 'Kingsman: The Secret Service',
        actors: ['Colin Firth', 'Samuel L. Jackson'],
    },
    {
        id: 10,
        title: 'Robin Hood: Men In Tights',
        actors: ['Cary Elwes', 'Roger Rees'],
    },
];

// GET requests
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname });
});

//Documentation
app.get('/documentation', (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

//API Routes
app.get('/movies', (req, res) => {
    res.json(topMovie);
});

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('INTERNAL SERVER ERROR');
});

// listen for requests
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
