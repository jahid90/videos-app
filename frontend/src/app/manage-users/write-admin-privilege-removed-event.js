const { v4: uuid } = require('uuid');

const writeAdminPrivilegeRemovedEvent = (context) => {
    const event = {
        id: uuid(),
        type: 'AdminPrivilegeRemoved',
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

module.exports = writeAdminPrivilegeRemovedEvent;
