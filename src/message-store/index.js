const createWrite = require('./write');

const createMessageStore = ({ db }) => {

    const write = createWrite({ db });

    return {
        write,
    }

}

module.exports = createMessageStore;
