const createWrite = require('./write');
const createRead = require('./read');
const configureCreateSubscription = require('./subscribe');

const createMessageStore = ({ db }) => {
    const write = createWrite({ db });
    const read = createRead({ db });

    const createSubscription = configureCreateSubscription({
        read: read.read,
        readLastMessage: read.readLastMessage,
        write,
    });

    return {
        createSubscription,
        write,
        read: read.read,
        readLastMessage: read.readLastMessage,
        fetch: read.fetch,
    };
};

module.exports = createMessageStore;
