const { v4: uuid } = require('uuid');

const writeAdminPrivilegeAddedEvent = (context) => {
    const event = {
        id: uuid(),
        type: 'AdminPrivilegeAdded',
        metadata: {
            traceId: context.traceId,
            userId: context.user.id,
        },
        data: {
            userId: context.user.id,
        },
    };
    const streamName = `identity-${context.user.id}`;

    return context.messageStore.write(streamName, event);
};

module.exports = writeAdminPrivilegeAddedEvent;
