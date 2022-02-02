const validate = require('validate.js');

const ValidationError = require('./validation-error');

const constraints = {
    description: {
        presence: {
            allowEmpty: false,
        },
    },
};

const ensureDescriptionIsValid = (context) => {
    const command = context.command;
    const validateMe = { description: command.data.description };
    const validationErrors = validate(validateMe, constraints);

    if (validationErrors) {
        throw new ValidationError(validationErrors, constraints, context.video);
    }

    return context;
};

module.exports = ensureDescriptionIsValid;
