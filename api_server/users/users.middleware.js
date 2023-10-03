const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || !usersDB.some(user => user.apiKey === apiKey)) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

module.exports = apiKeyAuth