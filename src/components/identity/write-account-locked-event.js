const { v4: uuid } = require('uuid');

const writeAccountLockedEvent = (context) => {
    const command = context.command;

    const accountLockedEvent = {
        id: uuid(),
        type: 'AccountLocked',
        metadata: {
            traceId: command.metadata.traceId,
            userId: command.metadata.userId,
        },
        data: {
            userId: command.data.userId,
            lockedTime: command.data.lockedTime,
        },
    };

    const identityStreamName = `identity-${command.data.userId}`;

    return context.messageStore
        .write(identityStreamName, accountLockedEvent)
        .then(() => context);
};

module.exports = writeAccountLockedEvent;
