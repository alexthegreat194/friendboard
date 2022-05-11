const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const prisma = require('./utils/prisma');

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

// auth middleware
app.use(function authenticateToken(req, res, next) {
    // Gather the jwt access token from the cookie
    const token = req.cookies.authToken;
  
    if (token) {
        jwt.verify(token, process.env.SECRET, (err, user) => {
            if (err) {
                console.log(err)
                // redirect to login if not logged in and trying to access a protected route
                next();

            } else {
                req.user = user
                next(); // pass the execution off to whatever request the client intended
            }
        })
    } else {
      next();
    }
});
  
app.use(async (req, res, next) => {
      // if a valid JWT token is present
    if (req.user) {
        // Look up the user's record
        const user = await prisma.user.findFirst({
            where: {
                id: req.user.id
            },
            include: {
                profile: true
            }
        })
        .then(currentUser => {
            // make the user object available in all controllers and templates
            res.locals.isAuthenticated = true;
            res.locals.currentUser = currentUser;
            next()
        }).catch(err => {
            console.log(err)
            res.locals.isAuthenticated = false;
            next()
        })
    } else {
        res.locals.isAuthenticated = false;
        next();
    }
});

// routes
auth = require('./controllers/auth');
profile = require('./controllers/profile');
dashboard = require('./controllers/dashboard');
group = require('./controllers/group');

app.use(auth);
app.use(profile);
app.use(dashboard);
app.use(group);

app.get('/', (req, res) => { 
    res.render('home', {
        layout: 'one-page'
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});