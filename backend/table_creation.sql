USE reporter_lab;

START TRANSACTION;

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    userID INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(32) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL,
    role ENUM('Regular', 'Administrator') NOT NULL DEFAULT 'Regular'
);

-- User Information Table
CREATE TABLE IF NOT EXISTS User_Info (
    userID INT PRIMARY KEY,
    firstName VARCHAR(32) NOT NULL,
    middleName VARCHAR(32),
    lastName VARCHAR(32) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    contactNumber VARCHAR(12) UNIQUE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS Categories (
    categoryID INT PRIMARY KEY AUTO_INCREMENT,
    categoryName VARCHAR(32) UNIQUE NOT NULL,
    categoryDescription TEXT
);

-- Locations Table
CREATE TABLE IF NOT EXISTS Locations (
    locationID INT PRIMARY KEY AUTO_INCREMENT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(64),
    district VARCHAR(64),
    city VARCHAR(64),
    state VARCHAR(64),
    country VARCHAR(64),
    postalCode VARCHAR(20),
    landmark VARCHAR(64)
);


-- Reports Table
CREATE TABLE IF NOT EXISTS Reports (
    reportID INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    locationID INT NOT NULL,
    categoryID INT NOT NULL,
    userID INT NOT NULL,
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Images Table
CREATE TABLE IF NOT EXISTS Images (
    imageID INT PRIMARY KEY AUTO_INCREMENT,
    imageURL VARCHAR(255) NOT NULL,
    reportID INT NOT NULL,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID)
);

-- Votes Table
CREATE TABLE IF NOT EXISTS Votes (
    voteID INT PRIMARY KEY AUTO_INCREMENT,
    reportID INT NOT NULL,
    userID INT NOT NULL,
    voteType ENUM('Upvote', 'Downvote') NOT NULL,
    votedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReportID) REFERENCES Reports(ReportID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

COMMIT;