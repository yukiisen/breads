-- Active: 1732891129554@@127.0.0.1@3306@breads
DROP DATABASE breads;

CREATE DATABASE IF NOT EXISTS breads;

USE breads;

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT UNIQUE NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(30) UNIQUE NOT NULL, 
    `password` VARCHAR(100) NOT NULL,
    `name` VARCHAR(30) NOT NULL DEFAULT "Bread",
    `verified` BIT NOT NULL DEFAULT 0,
    `picture` VARCHAR(32) NOT NULL DEFAULT "mainimage",
    -- wether the image was uploaded into github for external storage xD
    `github` BIT NOT NULL DEFAULT 0,
    `bio` VARCHAR(150) NULL,
    `email` VARCHAR(50) NULL,
    `joindate` DATETIME NOT NULL,
    PRIMARY KEY(`id`)
) AUTO_INCREMENT=1001;

CREATE TABLE IF NOT EXISTS `posts` (
    `id` INT NOT NULL UNIQUE AUTO_INCREMENT,
    `userID` INT NOT NULL,
    `content` VARCHAR(400) NOT NULL,
    `views` INT NOT NULL DEFAULT 0,
    `has_media` BIT DEFAULT 0,
    `quote` INT NULL DEFAULT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`quote`) REFERENCES `posts`(`id`)
) AUTO_INCREMENT=20001;

CREATE TABLE IF NOT EXISTS `media` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `postID` INT NOT NULL,
    `filename` VARCHAR(64) NOT NULL UNIQUE,
    `type` CHAR(4) NOT NULL,
    -- wether the image was uploaded into github for external storage xD
    `github` BIT NOT NULL DEFAULT 0,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`postID`) REFERENCES `posts`(`id`)
);

CREATE TABLE IF NOT EXISTS `follows` (
    `userID` INT NOT NULL,
    `follower_ID` INT NOT NULL,
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`follower_ID`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `block` (
    `userID` INT NOT NULL,
    `blocked_ID` INT NOT NULL,
    `date` DATETIME NOT NULL,
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`blocked_ID`) REFERENCES `users`(`id`)
);

CREATE TABLE IF NOT EXISTS `likes` (
    `id` INT NOT NULL UNIQUE AUTO_INCREMENT,
    `userID` INT NOT NULL,
    `postID` INT NOT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`postID`) REFERENCES `posts`(`id`)
);

CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT UNIQUE NOT NULL AUTO_INCREMENT,
    `userID` INT NOT NULL,
    `postID` INT NOT NULL,
    `content` VARCHAR(300) NOT NULL,
    `refrence` INT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`postID`) REFERENCES `posts`(`id`),
    FOREIGN KEY(`refrence`) REFERENCES `comments`(`id`)
) AUTO_INCREMENT=10001;

CREATE TABLE IF NOT EXISTS `comment_likes` (
    `id` INT NOT NULL UNIQUE AUTO_INCREMENT,
    `userID` INT NOT NULL,
    `commentID` INT NOT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`),
    FOREIGN KEY(`commentID`) REFERENCES `comments`(`id`)
) AUTO_INCREMENT=1002;

CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT UNIQUE NOT NULL AUTO_INCREMENT,
    `userID` INT NOT NULL,
    `content` VARCHAR(50) NOT NULL,
    `date` DATETIME NOT NULL,
    `link` VARCHAR(100) NOT NULL,
    `seen` BIT NOT NULL DEFAULT 0,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`)
) AUTO_INCREMENT=2001;

CREATE TABLE IF NOT EXISTS `saved` (
    `id` INT UNIQUE NOT NULL AUTO_INCREMENT,
    `postID` INT NOT NULL,
    `userID` INT NOT NULL,
    `date` DATETIME NOT NULL,
    PRIMARY KEY(`id`),
    FOREIGN KEY(`postID`) REFERENCES `posts`(`id`),
    FOREIGN KEY(`userID`) REFERENCES `users`(`id`)
) AUTO_INCREMENT=5001;