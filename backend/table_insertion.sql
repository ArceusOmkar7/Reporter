USE reporter_lab;

START TRANSACTION;

-- Users Table Inserts
INSERT INTO Users (Username, Password, Role) VALUES
('luffy_monkey', 'goingmerry', 'Regular'),
('zoro_roronoa', 'three_sword_style', 'Regular'),
('naruto_uzumaki', 'rasengan123', 'Administrator'),
('sasuke_uchiha', 'sharingan456', 'Regular'),
('ichigo_kurosaki', 'zangetsu789', 'Regular'),
('rukia_kuchiki', 'sode_no_shirayuki', 'Regular'),
('nami_navigator', 'climatact', 'Regular'),
('hinata_hyuga', 'byakugan123', 'Regular'),
('sakura_haruno', 'cherry_blossom', 'Regular'),
('kakashi_hatake', 'chidori567', 'Administrator');

-- User_Info Table Inserts
INSERT INTO User_Info (UserID, FirstName, MiddleName, LastName, Email, ContactNumber) VALUES
(1, 'Monkey', 'D.', 'Luffy', 'luffy@gmail.com', '555-111-1111'),
(2, 'Roronoa', NULL, 'Zoro', 'zoro@gmail.com', '555-222-2222'),
(3, 'Naruto', NULL, 'Uzumaki', 'naruto@yahoo.com', '555-333-3333'),
(4, 'Sasuke', NULL, 'Uchiha', 'sasuke@hotmail.com', '555-444-4444'),
(5, 'Ichigo', NULL, 'Kurosaki', 'ichigo@gmail.com', '555-555-5555'),
(6, 'Rukia', NULL, 'Kuchiki', 'rukia@outlook.com', '555-666-6666'),
(7, 'Nami', NULL, 'Navigator', 'nami@gmail.com', '555-777-7777'),
(8, 'Hinata', NULL, 'Hyuga', 'hinata@yahoo.com', '555-888-8888'),
(9, 'Sakura', NULL, 'Haruno', 'sakura@gmail.com', '555-999-9999'),
(10, 'Kakashi', NULL, 'Hatake', 'kakashi@outlook.com', '555-000-0000');

-- Categories Table Inserts
INSERT INTO Categories (CategoryName, CategoryDescription) VALUES
('Traffic', 'Reports related to traffic issues and violations'),
('Infrastructure', 'Issues related to roads, bridges, and public facilities'),
('Environment', 'Environmental concerns and pollution reports'),
('Public Safety', 'Safety hazards and emergency situations'),
('Community Events', 'Local gatherings and community activities');

-- Locations Table Inserts (flattened schema with city, state, country)
INSERT INTO Locations (Latitude, Longitude, Street, PostalCode, Landmark, District, City, State, Country) VALUES
(34.052235, -118.243683, '123 W 1st Street', '90012', 'Near City Hall', 'Downtown', 'Los Angeles', 'California', 'United States'),
(40.712776, -74.005974, '350 Fifth Avenue', '10118', 'Empire State Building', 'Manhattan', 'New York City', 'New York', 'United States'),
(35.658500, 139.745133, '1-2-3 Shibuya Crossing', '150-0002', 'Near Hachiko Statue', 'Shibuya', 'Tokyo', 'Tokyo Prefecture', 'Japan'),
(43.650943, -79.381713, '100 King Street West', 'M5X 1E3', 'Near CN Tower', 'Financial District', 'Toronto', 'Ontario', 'Canada'),
(-33.868820, 151.209290, '42 Pitt Street', '2000', 'Near Sydney Opera House', 'Central Business District', 'Sydney', 'New South Wales', 'Australia');

-- Reports Table Inserts
INSERT INTO Reports (Title, Description, LocationID, CategoryID, UserID) VALUES
('Pothole on Main Street', 'Large pothole causing traffic delays and potential vehicle damage', 1, 2, 1),
('Illegal Parking', 'Multiple vehicles parked in no-parking zone blocking pedestrian access', 2, 1, 3),
('Water Pollution in Local River', 'Unusual discoloration and odor in the river near the bridge', 3, 3, 5),
('Fallen Tree Blocking Road', 'Large tree down after storm blocking both lanes of traffic', 4, 4, 9),
('Community Cleanup Event', 'Volunteer opportunity this weekend to clean up local park', 5, 5, 2),
('Broken Traffic Light', 'Traffic signal at main intersection not functioning properly', 1, 1, 8),
('Graffiti on Public Building', 'Vandalism on the east wall of the public library', 2, 4, 6),
('Excessive Noise from Construction', 'Construction crew working past permitted hours', 3, 4, 7),
('Abandoned Vehicle', 'Car appears to have been abandoned for several weeks', 4, 1, 4),
('Free Health Screening Event', 'Mobile health clinic offering free screenings this Thursday', 5, 5, 10);

-- Images Table Inserts
INSERT INTO Images (ImageURL, ReportID) VALUES
('pothole_main_street.jpg', 1),
('illegal_parking_5th_ave.jpg', 2),
('river_pollution_shibuya.jpg', 3),
('fallen_tree_king_street.jpg', 4),
('community_cleanup_poster.jpg', 5),
('broken_traffic_light.jpg', 6),
('library_graffiti.jpg', 7),
('night_construction.jpg', 8),
('abandoned_vehicle.jpg', 9),
('health_screening_flyer.jpg', 10);

-- Votes Table Inserts
INSERT INTO Votes (ReportID, UserID, VoteType) VALUES
(1, 2, 'Upvote'),
(1, 3, 'Upvote'),
(1, 4, 'Downvote'),
(2, 1, 'Upvote'),
(2, 5, 'Upvote'),
(3, 6, 'Upvote'),
(4, 7, 'Downvote'),
(5, 8, 'Upvote'),
(6, 9, 'Upvote'),
(7, 10, 'Downvote'),
(8, 1, 'Upvote'),
(9, 3, 'Downvote'),
(10, 5, 'Upvote'),
(10, 7, 'Upvote'),
(10, 9, 'Upvote');

COMMIT;
