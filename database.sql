-- Campus Lost & Found Management System
-- Database Schema

CREATE DATABASE IF NOT EXISTS campus_lost_found;
USE campus_lost_found;

-- Users table (required for login/register/forgot-password)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset_token (reset_token)
);

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('Lost', 'Found') NOT NULL,
    item_category VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    date_reported DATE NOT NULL,
    contact_name VARCHAR(150) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    status ENUM('Active', 'Claimed', 'Resolved') NOT NULL DEFAULT 'Active',
    image_url VARCHAR(500) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_date (date_reported)
);

INSERT INTO items (title, description, category, item_category, location, date_reported, contact_name, contact_email, contact_phone, status) VALUES
('Black Laptop Bag', 'A black laptop bag with a QIU sticker, contains charger and notebooks.', 'Lost', 'Electronics', 'Library, 2nd Floor', '2025-01-15', 'Ahmad bin Razak', 'ahmad@student.qiu.edu.my', '0123456789', 'Active'),
('Found: Student ID Card', 'Found a student ID card near the cafeteria entrance.', 'Found', 'Documents', 'Main Cafeteria', '2025-01-16', 'Security Office', 'security@qiu.edu.my', '0198765432', 'Active'),
('Blue Water Bottle', 'Blue Hydro Flask water bottle, 32oz, has a dent on the bottom.', 'Lost', 'Personal Items', 'Sports Complex', '2025-01-17', 'Siti Noor', 'siti@student.qiu.edu.my', '0112345678', 'Active');