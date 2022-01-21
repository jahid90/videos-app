const { v4 : uuid } = require('uuid');

module.exports = (req, res, next) => {

    req.context = {
        traceId: uuid()
    }

    next();

}
