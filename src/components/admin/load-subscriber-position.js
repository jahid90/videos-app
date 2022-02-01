const subscriberPositionProjection = require('./subscriber-position-projection.js');

const loadSubscriberPosition = (context) => {
    const messageStore = context.messageStore;
    const command = context.command;
    const subscriberPositionStreamName = `subscriberPosition-${command.metadata.subscriberId}`;

    return messageStore
        .fetch(subscriberPositionStreamName, subscriberPositionProjection)
        .then((subscriberPosition) => {
            context.subscriberPosition = subscriberPosition;
            return context;
        });
};

module.exports = loadSubscriberPosition;
