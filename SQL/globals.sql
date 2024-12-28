--isBlocked => QUERY:
SELECT * FROM block WHERE userID=(SELECT id FROM users WHERE username=?) AND blocked_ID=?;
--END_QUERY