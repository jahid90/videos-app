const { v4: uuid } = require('uuid');

const writeRegisteredEvent = (context) => {
    const command = context.command;

    const registeredEvent = {
        id: uuid(),
        type: 'Registered',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            userId: command.data.userId,
            email: command.data.email,
            passwordHash: command.data.passwordHash,
        },
    };

    const identityStreamName = `identity-${command.data.userId}`;

    return context.messageStore
        .write(identityStreamName, registeredEvent)
        .then(() => context);
};

module.exports = writeRegisteredEvent;
