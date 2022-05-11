const AuthenticationError = require('../../errors/authentication-error');

const handleCredentialNotFound = (context) => {
    throw new AuthenticationError();
};

module.exports = handleCredentialNotFound;
