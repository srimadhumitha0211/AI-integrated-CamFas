const express = require('express');
const app = express();

app.get('/hod/dashboard', (req, res) => {
    console.log('HOD ROUTE HIT!');
    res.send('HOD WORKS 100%');
});

app.get('/', (req, res) => {
    res.send('<a href="/hod/dashboard">GO TO HOD</a>');
});

app.listen(5000, () => {
    console.log('Test server on http://localhost:5000');
    console.log('Visit: http://localhost:5000/hod/dashboard');
});