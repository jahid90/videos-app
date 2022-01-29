const CommandAlreadyProcessedError = require('./command-already-processed-error');

const ensureCommandHasNotBeenProcessed = (context) => {
    const { command, video } = context;

    if (video.sequence > command.globalPosition) {
        throw new CommandAlreadyProcessedError();
    }

    return context;
};

module.exports = ensureCommandHasNotBeenProcessed;
