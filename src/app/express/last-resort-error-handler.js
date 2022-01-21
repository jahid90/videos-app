module.exports = (err, req, res, next) => {

    const traceId = req.context ? req.context.traceId : 'None';
    console.error(traceId, err);

    res.status(500).send('error');

}
