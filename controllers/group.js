
const prisma = require('../utils/prisma')
const express = require('express')

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

router.get('/', async (req, res) => {
    res.redirect('/dashboard')
});

router.get('/group/:code', async (req, res) => {
    const group = await prisma.group.findFirst({
        where: {
            code: req.params.code
        },
        include: {
            owner: {
                include: {
                    profile: true
                }
            }
        }
    });

    if (!group) {
        console.log('group not found')
        return res.redirect('/dashboard')
    }

    res.render('group', {
        group
    });

});
    

module.exports = router;