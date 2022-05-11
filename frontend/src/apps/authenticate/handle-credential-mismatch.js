const { v4: uuid } = require('uuid');

const AuthenticationError = require('../../errors/authentication-error');

const handleCredentialMismatch = (context) => {
    const event = {
        id: uuid(),
        type: 'UserLoginFailed',
        metadata: {
            traceId: context.traceId,
            userId: null,
        },
        data: {
            userId: context.userCredential.id,
            reason: 'Incorrect password',
        },
    };

    const streamName = `authentication-${context.userCredential.id}`;

    return context.messageStore.write(streamName, event).then(() => {
        throw new AuthenticationError();
    });
};

module.exports = handleCredentialMismatch;
