--getProfileMetadata => QUERY:
SELECT username, name, verified, picture, github, bio FROM users WHERE username=?;
--END_QUERY

--GetFollowData => QUERY:
/* followers first then followings */
SELECT count(`userID`) as count FROM follows WHERE userID=(SELECT id FROM users WHERE username=?)
UNION
SELECT count(`userID`) as count FROM follows WHERE follower_ID=(SELECT id FROM users WHERE username=?);
--END_QUERY

--GetUserEmail => QUERY:
SELECT email FROM users WHERE id=?;
--END_QUERY

--GetProfilePicture => QUERY:
SELECT picture FROM users WHERE id=?;
--END_QUERY

--EditProfile => QUERY:
UPDATE users SET username=?, name=?, bio=?, email=?, picture=? WHERE id=?;
--END_QUERY