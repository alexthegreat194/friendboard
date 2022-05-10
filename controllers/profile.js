const express = require('express')
const router = express.Router()

const prisma = require('../utils/prisma')
const axios = require('axios');

router.get('/profile', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    const profile = await prisma.profile.findFirst({
        where: {
            userId: res.locals.currentUser.id
        }
    });

    if (!profile) {
        return res.redirect('/profile/new')
    }

    res.render('profile', {
        profile
    });
})

router.get('/profile/new', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    const profile = await prisma.profile.findFirst({
        where: {
            userId: res.locals.currentUser.id
        }
    });

    if (profile) {
        return res.redirect('/profile')
    }

    res.render('profile-new');
})

router.post('/profile/new', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    const data = req.body;

    if (!data.name || !data.birthday || !data.bio || !data.pronouns) {
        return res.redirect('/profile/new');
    }

    const profile = await prisma.profile.create({
        data: {
            name: data.name,
            birthday: new Date(data.birthday),
            bio: data.bio,
            pronouns: data.pronouns,
            userId: res.locals.currentUser.id
        }
    })
    .catch(err => {
        console.log(err);
        return res.redirect('/profile/new');
    });
    
    res.redirect('/profile');
});

module.exports = router