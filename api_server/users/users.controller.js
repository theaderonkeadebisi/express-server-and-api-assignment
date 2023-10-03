function createUser(req, res) {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    // Check for duplicate username
    if (usersDB.some(user => user.username === username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    const newUser = {
        username,
        apiKey: generateApiKey(), // Generate a unique API key
        role: 'user', // Default role for new users
    };

    usersDB.push(newUser);
    fs.writeFile(usersDbPath, JSON.stringify(usersDB), (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'Internal Server Error. Could not save user data.' });
        }
        res.status(201).json({ message: 'User created successfully' });
    });
}

function generateApiKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function loginUser(req, res) {
    const { username } = req.body;

    const user = usersDB.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey);
    res.json({ token });
}