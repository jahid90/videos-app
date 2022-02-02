const { v4: uuid } = require('uuid');

const writeFailedEvent = (context, err) => {
    const sendCommand = context.sendCommand;
    const streamName = `sendEmail-${sendCommand.data.emailId}`;

    const event = {
        id: uuid(),
        type: 'Failed',
        metadata: {
            originStreamName: sendCommand.metadata.originStreamName,
            traceId: sendCommand.metadata.traceId,
            userId: sendCommand.metadata.userId,
        },
        data: {
            ...sendCommand.data,
            reason: err.message,
        },
    };

    return context.messageStore.write(streamName, event).then(() => context);
};

module.exports = writeFailedEvent;
