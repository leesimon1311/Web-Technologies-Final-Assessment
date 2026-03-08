-- ─────────────────────────────────────────────────────────────────────────────
-- Campus Lost & Found Management System
-- Database Schema — run once in phpMyAdmin or MySQL CLI
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS campus_lost_found
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campus_lost_found;

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(150) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,              -- bcrypt hash
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ─── Items ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS items (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255)  NOT NULL,
  description   TEXT          NOT NULL,
  category      ENUM('Lost','Found')                NOT NULL,
  item_category VARCHAR(100)  NOT NULL,
  location      VARCHAR(255)  NOT NULL,
  date_reported DATE          NOT NULL,
  contact_name  VARCHAR(150)  NOT NULL,
  contact_email VARCHAR(255)  NOT NULL,
  contact_phone VARCHAR(20)   DEFAULT NULL,
  status        ENUM('Active','Claimed','Resolved') NOT NULL DEFAULT 'Active',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_category (category),
  INDEX idx_status   (status),
  INDEX idx_date     (date_reported)
);