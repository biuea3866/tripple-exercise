CREATE DATABASE TRIPPLE_AUTH;

USE TRIPPLE_AUTH;

CREATE TABLE users(
    user_id VARCHAR(100) NOT NULL UNIQUE,
    point INT(100) DEFAULT 0,
    id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB
  default charset=utf8mb4 collate utf8mb4_unicode_ci;


CREATE TABLE history(
    user_id VARCHAR(100) NOT NULL REFERENCES users(user_id),
    type VARCHAR(10) NOT NULL,
    status VARCHAR(10) NOT NULL,
    review_id VARCHAR(100) NOT NULL,
    history VARCHAR(200) NOT NULL,
    id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB
  default charset=utf8mb4 collate utf8mb4_unicode_ci;


INSERT INTO users VALUES(UUID(), 0, 0);
INSERT INTO users VALUES(UUID(), 0, 0);
INSERT INTO users VALUES(UUID(), 0, 0);
INSERT INTO users VALUES(UUID(), 0, 0);
INSERT INTO users VALUES(UUID(), 0, 0);

CREATE DATABASE TRIPPLE_PLACE;

USE TRIPPLE_PLACE;

CREATE TABLE places(
    place_id VARCHAR(100) NOT NULL UNIQUE,
    id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB
  default charset=utf8mb4 collate utf8mb4_unicode_ci;

CREATE TABLE reviews(
    type VARCHAR(20) NOT NULL,
    review_id VARCHAR(100) NOT NULL UNIQUE,
    content VARCHAR(255),
    status VARCHAR(10) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    place_id VARCHAR(100) NOT NULL,
    id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB
  default charset=utf8mb4 collate utf8mb4_unicode_ci;

CREATE TABLE photos(
    photo_id VARCHAR(100) NOT NULL UNIQUE,
    review_id VARCHAR(100) NOT NULL REFERENCES reviews(review_id),
    status VARCHAR(30) NOT NULL,
    image VARCHAR(100) NOT NULL,
    id INT(100) NOT NULL AUTO_INCREMENT PRIMARY KEY
) ENGINE=InnoDB
  default charset=utf8mb4 collate utf8mb4_unicode_ci;

INSERT INTO places VALUES(UUID(), 0);
INSERT INTO places VALUES(UUID(), 0);
INSERT INTO places VALUES(UUID(), 0);
INSERT INTO places VALUES(UUID(), 0);
INSERT INTO places VALUES(UUID(), 0);