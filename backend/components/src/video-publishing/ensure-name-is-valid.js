const validate = require('validate.js');

const ValidationError = require('./validation-error');

const constraints = {
    name: {
        presence: {
            allowEmpty: false,
        },
    },
};

const ensureNameIsValid = (context) => {
    const command = context.command;
    const validateMe = { name: command.data.name };
    const validationErrors = validate(validateMe, constraints);

    if (validationErrors) {
        throw new ValidationError(validationErrors, constraints, context.video);
    }

    return context;
};

module.exports = ensureNameIsValid;
