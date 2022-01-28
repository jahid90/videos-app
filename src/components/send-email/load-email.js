const emailProjection = {
    $init: () => {
        return {
            isSent: false,
        };
    },
    Sent: (email, sent) => {
        email.isSent = true;
        return email;
    },
};

const loadEmail = (context) => {
    const messageStore = context.messageStore;
    const sendCommand = context.sendCommand;
    const streamName = `sendEmail-${sendCommand.data.emailId}`;

    return messageStore.fetch(streamName, emailProjection).then((email) => {
        context.email = email;
        return context;
    });
};

module.exports = loadEmail;
