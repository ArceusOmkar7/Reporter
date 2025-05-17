USE reporter_lab;

START TRANSACTION;

-- Users Table Inserts
INSERT INTO Users (Username, Password, Role) VALUES
('omkar_mahindrakar', 'password123', 'Regular'),
('abdulrauf_kazi', 'password123', 'Regular'),
('abhinav_hazarika', 'password123', 'Administrator'),
('abhyuday_rakam', 'password123', 'Regular'),
('pratham_sharma', 'password123', 'Regular'),
('amaan_surti', 'password123', 'Regular'),
('pooja_verma', 'password123', 'Regular'),
('aanya_patel', 'password123', 'Regular'),
('divya_chandra', 'password123', 'Regular'),
('siddharth_joshi', 'password123', 'Administrator');

-- User_Info Table Inserts
INSERT INTO User_Info (UserID, FirstName, MiddleName, LastName, Email, ContactNumber) VALUES
(1, 'Omkar', NULL, 'Mahindrakar', 'omkar@gmail.com', '911-111-1111'),
(2, 'Abdulrauf', NULL, 'Kazi', 'abdul@gmail.com', '911-222-2222'),
(3, 'Abhinav', NULL, 'Hazarika', 'abhinav@yahoo.com', '911-333-3333'),
(4, 'Abhyuday', NULL, 'Rakam', 'abhyuday@hotmail.com', '911-444-4444'),
(5, 'Pratham', NULL, 'Sharma', 'pratham@gmail.com', '911-555-5555'),
(6, 'Amaan', NULL, 'Surti', 'amaan@outlook.com', '911-666-6666'),
(7, 'Pooja', NULL, 'Verma', 'pooja@gmail.com', '911-777-7777'),
(8, 'Aanya', NULL, 'Patel', 'aanya@yahoo.com', '911-888-8888'),
(9, 'Divya', NULL, 'Chandra', 'divya@gmail.com', '911-999-9999'),
(10, 'Siddharth', NULL, 'Joshi', 'sid@outlook.com', '911-000-0000');

-- Categories Table Inserts
INSERT INTO Categories (CategoryName, CategoryDescription) VALUES
('Traffic', 'Reports related to traffic issues and violations'),
('Infrastructure', 'Issues related to roads, bridges, and public facilities'),
('Environment', 'Environmental concerns and pollution reports'),
('Public Safety', 'Safety hazards and emergency situations'),
('Community Events', 'Local gatherings and community activities');

-- Locations Table Inserts (Indian cities and locations)
INSERT INTO Locations (Latitude, Longitude, Street, PostalCode, Landmark, District, City, State, Country) VALUES
(18.9220, 72.8347, 'Marine Drive', '400020', 'Near Nariman Point', 'South Mumbai', 'Mumbai', 'Maharashtra', 'India'),
(28.6139, 77.2090, 'Connaught Place', '110001', 'Rajiv Chowk', 'Central Delhi', 'New Delhi', 'Delhi', 'India'),
(22.5726, 88.3639, 'Park Street', '700016', 'Near Victoria Memorial', 'Kolkata Central', 'Kolkata', 'West Bengal', 'India'),
(12.9716, 77.5946, 'MG Road', '560001', 'Near Cubbon Park', 'Central Bangalore', 'Bengaluru', 'Karnataka', 'India'),
(17.3850, 78.4867, 'Hitech City', '500081', 'Near Cyber Towers', 'Madhapur', 'Hyderabad', 'Telangana', 'India');

-- Reports Table Inserts
INSERT INTO Reports (Title, Description, LocationID, CategoryID, UserID) VALUES
('Pothole on Marine Drive', 'Large pothole causing traffic delays and potential vehicle damage near NCPA', 1, 2, 1),
('Illegal Parking in Connaught Place', 'Multiple vehicles parked in no-parking zone blocking pedestrian access near central circle', 2, 1, 3),
('Yamuna River Pollution', 'Severe water pollution and foaming in the Yamuna River near ITO bridge', 2, 3, 5),
('Fallen Tree Blocking Road in Salt Lake', 'Large tree down after monsoon storm blocking both lanes of traffic', 3, 4, 9),
('Community Cleanup Drive at Juhu Beach', 'Volunteer opportunity this weekend to clean up Juhu Beach', 1, 5, 2),
('Traffic Signal Not Working on MG Road', 'Traffic signal at MG Road and Brigade Road intersection not functioning properly', 4, 1, 8),
('Graffiti on Metro Station Wall', 'Vandalism on the east wall of the Rajiv Chowk Metro Station', 2, 4, 6),
('Excessive Construction Noise in Bandra', 'Construction crew working past permitted hours disturbing residential area', 1, 4, 7),
('Abandoned Vehicle in Jubilee Hills', 'Car appears to have been abandoned for several weeks near Road No. 5', 5, 1, 4),
('Free Medical Camp at Gandhi Maidan', 'Mobile health clinic offering free screenings and medicines this Sunday', 3, 5, 10);

-- Default Category Images
INSERT INTO Images (ImageURL, ReportID) VALUES
('http://localhost:8000/backend/uploads/default_traffic.jpg', 6),
('http://localhost:8000/backend/uploads/default_infrastructure.jpg', 1),
('http://localhost:8000/backend/uploads/default_environment.jpg', 3),
('http://localhost:8000/backend/uploads/default_public_safety.jpg', 4),
('http://localhost:8000/backend/uploads/default_community_events.jpg', 5);

-- Votes Table Inserts (making sure some reports have negative votes)
INSERT INTO Votes (ReportID, UserID, VoteType) VALUES
(1, 2, 'Upvote'),
(1, 3, 'Upvote'),
(1, 4, 'Upvote'),
(2, 1, 'Downvote'),
(2, 5, 'Downvote'),
(2, 6, 'Downvote'),
(3, 6, 'Upvote'),
(3, 7, 'Upvote'),
(4, 7, 'Downvote'),
(4, 8, 'Downvote'),
(4, 9, 'Downvote'),
(5, 8, 'Upvote'),
(6, 9, 'Upvote'),
(7, 10, 'Downvote'),
(7, 1, 'Downvote'),
(8, 1, 'Upvote'),
(9, 3, 'Downvote'),
(9, 4, 'Downvote'),
(10, 5, 'Upvote'),
(10, 7, 'Upvote'),
(10, 9, 'Upvote');

COMMIT;
