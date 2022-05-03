const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

require('dotenv').config();

app = express();

// app config
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'main'
}));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(express.static("public")); // static files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());

// routes
auth = require('./controllers/auth');

app.use(auth);

app.get('/', (req, res) => { 
    res.render('home');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});