const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = (context) => {
    return bcrypt
        .hash(context.attributes.password, SALT_ROUNDS)
        .then((passwordHash) => {
            context.passwordHash = passwordHash;

            return context;
        });
};

module.exports = hashPassword;
