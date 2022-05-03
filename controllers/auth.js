const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const express = require('express');
const router = express.Router();

const generateToken = (user) => {
    let token = jwt.sign({id: user.id}, process.env.SECRET, {
        expiresIn: '1h'
    });
    return token;
}

const generateHash = async (password) => {
    return bcrypt.hash(password, 10);
}

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        return res.redirect('/signup');
    }

    const hash = await generateHash(data.password);

    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hash
        }
    })
    .catch(err => {
        console.log(err);
        return res.redirect('/signup');
    });

    const token = generateToken(user);
    res.cookie('authToken', token);

    res.redirect('/');
})

router.post('/login', async (req, res) => {
    const data = req.body;

    if (!data.email || !data.password) {
        return res.redirect('/login');
    }

    const user = await prisma.user.findFirst({
        where: {
            email: data.email
        }
    });

    if (!user) {
        return res.redirect('/login');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
        return res.redirect('/login');
    }

    const token = generateToken(user);
    res.cookie('authToken', token);

    res.redirect('/');
})

module.exports = router;