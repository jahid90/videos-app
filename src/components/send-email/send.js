const nodemailer = require('nodemailer');

const SendError = require('./send-error');

const createSend = ({ transport }) => {
    const sender = nodemailer.createTransport(transport);

    const send = (email) => {
        const potentialError = new SendError();

        return sender.sendMail(email).catch((err) => {
            potentialError.message = err.message;
            throw potentialError;
        });
    };

    return send;
};

module.exports = createSend;
