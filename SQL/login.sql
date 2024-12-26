--isNameAvailable => QUERY:
SELECT username FROM users WHERE username=?;
--END_QUERY

--createUser => QUERY:
INSERT INTO users (
    `username`,
    `name`,
    `password`,
    `email`,
    `joindate`
) VALUES (?, ?, ?, ?, ?);
--END_QUERY

--existsuser => QUERY:
SELECT password, id FROM users WHERE username = ?;
--END_QUERY

--deserializeUser => QUERY:
SELECT id, username, password FROM users WHERE id = ?;
--END_QUERY