const { body, validationResult } = require('express-validator');
const xss = require('xss');

// Sanitize a string value
const sanitizeString = (value) => {
  if (typeof value !== 'string') return value;
  return xss(value.trim());
};

// Validation rules for item reports
const itemValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters')
    .customSanitizer(sanitizeString),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters')
    .customSanitizer(sanitizeString),

  body('category')
    .trim()
    .notEmpty().withMessage('Category (Lost/Found) is required')
    .isIn(['Lost', 'Found']).withMessage('Category must be either Lost or Found'),

  body('item_category')
    .trim()
    .notEmpty().withMessage('Item category is required')
    .isIn(['Electronics', 'Documents', 'Personal Items', 'Clothing', 'Keys', 'Accessories', 'Books', 'Other'])
    .withMessage('Invalid item category'),

  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ min: 3, max: 255 }).withMessage('Location must be between 3 and 255 characters')
    .customSanitizer(sanitizeString),

  body('date_reported')
    .notEmpty().withMessage('Date is required')
    .isDate().withMessage('Invalid date format'),

  body('contact_name')
    .trim()
    .notEmpty().withMessage('Contact name is required')
    .isLength({ min: 2, max: 150 }).withMessage('Contact name must be between 2 and 150 characters')
    .customSanitizer(sanitizeString),

  body('contact_email')
    .trim()
    .notEmpty().withMessage('Contact email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('contact_phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number format'),

  body('status')
    .optional()
    .trim()
    .isIn(['Active', 'Claimed', 'Resolved']).withMessage('Invalid status value')
];

// Validation rules for status update
const statusValidationRules = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['Active', 'Claimed', 'Resolved']).withMessage('Status must be Active, Claimed, or Resolved')
];

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

module.exports = { itemValidationRules, statusValidationRules, validate };
