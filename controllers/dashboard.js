
const express = require('express')
const router = express.Router()

router.get('/dashboard', async (req, res) => {
    if (!res.locals.currentUser) {
        return res.redirect('/login');
    }

    res.render('dashboard')
});

module.exports = router