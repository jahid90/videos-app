module.exports = (req, res, next) => {

    res.locals.context = req.context;
    next();

}
