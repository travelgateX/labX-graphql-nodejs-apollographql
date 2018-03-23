const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./router/routes');
const cors = require('cors');
const PORT = process.env.PORT || 8080;
// Initialize the app
const app = express();

app.use(bodyParser.json());

app.use(cors());

app.use('/', routes.router);

app.listen(PORT, () => {
    console.log('API up and running http://localhost:' + PORT);
});