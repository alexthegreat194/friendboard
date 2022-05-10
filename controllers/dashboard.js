
const express = require('express');
const rcg = require('referral-code-generator');

const { group } = require('../utils/prisma');
const router = express.Router()

const prisma = require('../utils/prisma')

router.use(async (req, res, next) => {
    if (req.path == '/dashboard') {
        if (!res.locals.currentUser) {
            return res.redirect('/login');
        }

        // see if user has a profile
        const profile = await prisma.profile.findFirst({
            where: {
                userId: res.locals.currentUser.id
            }
        });

        if (!profile) {
            return res.redirect('/profile/new')
        }

        next();
        
    } else {
        next();
    }
});

router.get('/dashboard', async (req, res) => {

    const groups = await prisma.group.findMany({
        include: {
            usersInGroups: {
                include: {
                    user: {
                        include: {
                            profile: true
                        },
                        
                    },
                    group: true,
                }
            },
            owner: true,
        },
        where: {
            usersInGroups: {
                some: {
                    userId: res.locals.currentUser.id
                }
            }
        }
    });

    let inGroup = groups.length > 0;

    groups.map(group => {
        group.profiles = [];
        group.usersInGroups.map(userInGroup => {
            group.profiles.push(userInGroup.user.profile);
        });
    });

    console.log(groups);

    res.render('dashboard', {
        groups, inGroup
    })
});

router.post('/group/new', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    // see if user has a profile
    const profile = await prisma.profile.findFirst({
        where: {
            userId: res.locals.currentUser.id
        }
    });

    if (!profile) {
        return res.redirect('/profile/new')
    }
    
    const data = req.body;
    if (!data.name) {
        console.log('no name');
        return res.redirect('/dashboard');
    }

    const group = await prisma.group.create({
        data: {
            name: data.name,
            code: rcg.alpha('lowercase', 6),
            ownerId: res.locals.currentUser.id
        }
    });

    const userInGroup = await prisma.userInGroup.create({
        data: {
            userId: res.locals.currentUser.id,
            groupId: group.id
        }
    });

    res.redirect('/dashboard');
});

router.post('/group/join', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    // see if user has a profile
    const profile = await prisma.profile.findFirst({
        where: {
            userId: res.locals.currentUser.id
        }
    });

    if (!profile) {
        return res.redirect('/profile/new')
    }

    const data = req.body;
    if (!data.code) {
        console.log('no code');
        return res.redirect('/dashboard');
    }

    const group = await prisma.group.findFirst({
        where: {
            code: data.code
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }

    const foundUserInGroup = await prisma.userInGroup.findFirst({
        where: {
            userId: res.locals.currentUser.id,
            groupId: group.id
        }
    });

    if (foundUserInGroup) {
        console.log('already in group');
        return res.redirect('/dashboard');
    }

    const userInGroup = await prisma.userInGroup.create({
        data: {
            userId: res.locals.currentUser.id,
            groupId: group.id
        }
    });

    res.redirect('/dashboard');
});

// leave group
router.get('/group/leave/:code', async (req, res) => {
    req.params.code = req.params.code.toLowerCase();

    const group = await prisma.group.findFirst({
        where: {
            code: req.params.code
        }
    });

    if (!group) {
        console.log('no group');
        return res.redirect('/dashboard');
    }

    const userInGroup = await prisma.userInGroup.findFirst({
        where: {
            userId: res.locals.currentUser.id,
            groupId: group.id
        }
    });


    if (!userInGroup) {
        console.log('not in group');
        return res.redirect('/dashboard');
    }

    await prisma.userInGroup.delete({
        where: {
            id: userInGroup.id
        }
    });

    // console.log(userInGroup);
    console.log('user left group: ', req.params.code);

    res.redirect('/dashboard');
});

module.exports = router