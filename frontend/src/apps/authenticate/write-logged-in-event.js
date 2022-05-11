const { v4: uuid } = require('uuid');

const writeLoggedInEvent = (context) => {
    const event = {
        id: uuid(),
        type: 'UserLoggedIn',
        metadata: {
            traceId: context.traceId,
            userId: context.userCredential.id,
        },
        data: {
            userId: context.userCredential.id,
        },
    };

    const streamName = `authentication-${context.userCredential.id}`;

    return context.messageStore.write(streamName, event).then(() => context);
};

module.exports = writeLoggedInEvent;
