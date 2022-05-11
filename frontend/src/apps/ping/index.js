const express = require('express');

const createHandlers = ({ env }) => {
    const handlePing = (req, res) => {
        return res.send('OK');
    };

    return {
        handlePing,
    };
};

const createPingApp = ({ env }) => {
    const handlers = createHandlers({ env });

    const router = express.Router();
    router.get('/', handlers.handlePing);

    return router;
};

module.exports = createPingApp;
