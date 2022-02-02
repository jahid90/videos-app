const { v4: uuid } = require('uuid');

const writeRegisterCommand = (context) => {
    const userId = context.attributes.id;
    const stream = `identity:command-${userId}`;
    const command = {
        id: uuid(),
        type: 'Register',
        metadata: {
            traceId: context.traceId,
            userId,
        },
        data: {
            userId,
            email: context.attributes.email,
            passwordHash: context.passwordHash,
        },
    };

    return context.messageStore.write(stream, command);
};

module.exports = writeRegisterCommand;
