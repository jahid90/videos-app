const { v4: uuidv4, v5: uuidv5 } = require('uuid');

const uuidv5Namespace = '0c46e0b7-dfaf-443a-b150-053b67905cc2';

const writeSendCommand = (context) => {
    const event = context.event;
    const identity = context.identity;
    const email = context.email;

    const emailId = uuidv5(identity.email, uuidv5Namespace);

    const sendEmailCommand = {
        id: uuidv4(),
        type: 'Send',
        metadata: {
            originStreamName: `identity-${identity.id}`,
            traceId: event.metadata.traceId,
            userId: event.metadata.userId,
        },
        data: {
            emailId,
            to: identity.email,
            subject: email.subject,
            text: email.text,
            html: email.html,
        },
    };

    const streamName = `sendEmail:command-${emailId}`;

    return context.messageStore
        .write(streamName, sendEmailCommand)
        .then(() => context);
};

module.exports = writeSendCommand;
