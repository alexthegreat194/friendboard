
const prisma = require('../utils/prisma')
const express = require('express');
const { userInGroup } = require('../utils/prisma');

const router = express.Router()

// middleware to check if user is logged in
router.use(async (req, res, next) => {
    if (req.path == '/group') {
        if (!res.locals.currentUser) {
            return res.redirect('/login');
        }
    }
    next();
});



router.get('/group/:id', async (req, res) => {
    const group = await prisma.group.findFirst({
        where: {
            id: req.params.code
        },
        include: {
            owner: {
                include: {
                    profile: true
                }
            },
            usersInGroups: {
                include: {
                    user: true,
                    group: true
                }
            }
        }
    });

    if (!group) {
        console.log('group not found')
        return res.redirect('/dashboard')
    }

    console.log('group found: ', group)
    //check if user is in group
    let inGroup = false;
    group.usersInGroups.forEach(userInGroup => {
        console.log('userInGroup: ', userInGroup)
        if (userInGroup.userId == res.locals.currentUser.id) {
            inGroup = true;
        }
    });

    if (!inGroup) {
        console.log('user not in group')
        return res.redirect('/dashboard')
    }

    res.render('group', {
        group
    });

});
    

module.exports = router;