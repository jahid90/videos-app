const { v4: uuid } = require('uuid');

module.exports = (req, res, next) => {
    req.context = {
        traceId: uuid(),
        userId: req.session ? req.session.userId : null,
        isAdmin: req.session.role ? req.session.role.includes('admin') : false,
    };

    next();
};
