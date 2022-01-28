const sendEmail = (context) => {
    const justSendIt = context.justSendIt;
    const sendCommand = context.sendCommand;
    const systemSenderEmailAddress = context.systemSenderEmailAddress;

    const email = {
        from: systemSenderEmailAddress,
        to: sendCommand.data.to,
        subject: sendCommand.data.subject,
        text: sendCommand.data.text,
        html: sendCommand.data.html,
    };

    return justSendIt(email).then(() => context);
};

module.exports = sendEmail;
