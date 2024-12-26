--getUserPosts => QUERY:
SELECT id, 
    (SELECT username FROM users WHERE users.id=userID) as username, 
    (SELECT name FROM users WHERE users.id=userID) as name,
    ((SELECT verified FROM users WHERE users.id=userID)+0) as verified,
    (SELECT picture FROM users WHERE users.id=userID) as profile,
    content, views, has_media, quote, date,
    (SELECT count(likes.postID) FROM likes WHERE likes.postID=posts.id) as likes,
    (SELECT count(comments.postID) FROM comments WHERE comments.postID=posts.id) as comments,
    (SELECT count(ps.id) FROM posts as ps WHERE ps.quote=posts.id) as reposts
FROM posts WHERE userId=(SELECT users.id FROM users WHERE users.username = ?) AND
    /* User ID to check if he's blocked */
    NOT EXISTS (SELECT * FROM block 
    WHERE (block.userID=posts.userID AND blocked_ID=?) OR (block.userID=? AND blocked_ID=posts.userID))
ORDER BY date DESC;
--END_QUERY

--getPost => QUERY:
SELECT id, 
    (SELECT username FROM users WHERE users.id=userID) as username, 
    (SELECT name FROM users WHERE users.id=userID) as name,
    ((SELECT verified FROM users WHERE users.id=userID)+0) as verified,
    (SELECT picture FROM users WHERE users.id=userID) as profile,
    content, views, has_media, quote, date,
    (SELECT count(likes.postID) FROM likes WHERE likes.postID=posts.id) as likes,
    (SELECT count(comments.postID) FROM comments WHERE comments.postID=posts.id) as comments,
    (SELECT count(ps.id) FROM posts as ps WHERE ps.quote=posts.id) as reposts
FROM posts WHERE id=? AND
    /* User ID to check if he's blocked */
    NOT EXISTS (SELECT * FROM block 
    WHERE (block.userID=posts.userID AND blocked_ID=?) OR (block.userID=? AND blocked_ID=posts.userID))
ORDER BY date DESC;
--END_QUERY

--GetMyReactions => QUERY:
SELECT postID FROM likes WHERE userID=? AND postID IN (?);
--END_QUERY

--GetMySaves => QUERY:
SELECT postID FROM saved WHERE userID=? AND postID IN (?);
--END_QUERY

--GetPostsImages => QUERY:
SELECT postID, filename, type, github FROM media 
WHERE postID IN (?);
--END_QUERY