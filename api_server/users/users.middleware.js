const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !usersDB.some(user => user.apiKey === apiKey)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

const ValidateUserCreation = (req, res, next) => {
    const { username, apiKey } = req.body;

    if (!username || !apiKey) {
        return res.status(400).json({ message: 'Username and API Key are required' });
    }

    next();
};

const authorizeAdmin = (req, res, next) => {
    const user = req.user;

    if (user && user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
};

module.exports = {
    apiKeyAuth,
    ValidateUserCreation,
    authorizeAdmin,
};
