const mustBeLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/log-in');
    }

    return next();
};

module.exports = mustBeLoggedIn;
