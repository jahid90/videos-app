const ValidationError = require('../../errors/validation-error');

const ensureThereWasNoExistingIdentity = (context) => {
    if (context.existingIdentity) {
        throw new ValidationError({ email: ['already taken'] });
    }

    return context;
};

module.exports = ensureThereWasNoExistingIdentity;
