const bcrypt = require('bcrypt');

const CredentialsMismatchError = require('../errors/credential-mismatch-error');

const validatePassword = (context) => {
    return bcrypt
        .compare(context.password, context.userCredential.passwordHash)
        .then((matched) => {
            if (!matched) {
                throw new CredentialsMismatchError();
            }

            return context;
        });
};

module.exports = validatePassword;
