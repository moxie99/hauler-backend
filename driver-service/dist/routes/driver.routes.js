"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const driver_controller_1 = require("../controllers/driver.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('phone').notEmpty().withMessage('Phone number is required'),
], validate_middleware_1.validateRequest, driver_controller_1.register);
router.post('/confirm-otp', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('otp')
        .isLength({ min: 4, max: 4 })
        .withMessage('OTP must be 4 digits'),
], validate_middleware_1.validateRequest, driver_controller_1.confirmOtp);
router.post('/resend-otp', [(0, express_validator_1.body)('email').isEmail().withMessage('Invalid email format')], validate_middleware_1.validateRequest, driver_controller_1.resendOtp);
router.get('/pending', auth_middleware_1.authenticate, driver_controller_1.getPendingDrivers);
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Invalid email format'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], validate_middleware_1.validateRequest, driver_controller_1.login);
router.get('/profile', auth_middleware_1.authenticate, driver_controller_1.getProfile);
router.put('/profile', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('Name cannot be empty'),
    (0, express_validator_1.body)('phone')
        .optional()
        .notEmpty()
        .withMessage('Phone number cannot be empty'),
    (0, express_validator_1.body)('vehicleType')
        .optional()
        .notEmpty()
        .withMessage('Vehicle type cannot be empty'),
    (0, express_validator_1.body)('licenseNumber')
        .optional()
        .notEmpty()
        .withMessage('License number cannot be empty'),
], validate_middleware_1.validateRequest, driver_controller_1.updateProfile);
router.put('/status', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('driverId').notEmpty().withMessage('Driver ID is required'),
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'approved', 'suspended'])
        .withMessage('Invalid status'),
], validate_middleware_1.validateRequest, driver_controller_1.updateStatus);
router.post('/kyc', auth_middleware_1.authenticate, [
    (0, express_validator_1.body)('dateOfBirth')
        .isISO8601()
        .toDate()
        .withMessage('Invalid date of birth format'),
    (0, express_validator_1.body)('residentialAddress')
        .notEmpty()
        .withMessage('Residential address is required'),
    (0, express_validator_1.body)('nin').notEmpty().withMessage('NIN is required'),
    (0, express_validator_1.body)('vehicleType').notEmpty().withMessage('Vehicle type is required'),
    (0, express_validator_1.body)('licenseNumber').notEmpty().withMessage('License number is required'),
    (0, express_validator_1.body)('photoId').notEmpty().withMessage('Photo ID is required'),
    (0, express_validator_1.body)('selfie').notEmpty().withMessage('Selfie is required'),
    (0, express_validator_1.body)('driverLicense.number')
        .notEmpty()
        .withMessage('Driver license number is required'),
    (0, express_validator_1.body)('driverLicense.category')
        .notEmpty()
        .withMessage('Driver license category is required'),
    (0, express_validator_1.body)('driverLicense.issueDate')
        .isISO8601()
        .toDate()
        .withMessage('Invalid issue date format'),
    (0, express_validator_1.body)('driverLicense.expiryDate')
        .isISO8601()
        .toDate()
        .withMessage('Invalid expiry date format'),
    (0, express_validator_1.body)('vehicle.registrationDocument')
        .notEmpty()
        .withMessage('Vehicle registration document is required'),
    (0, express_validator_1.body)('vehicle.make').notEmpty().withMessage('Vehicle make is required'),
    (0, express_validator_1.body)('vehicle.model').notEmpty().withMessage('Vehicle model is required'),
    (0, express_validator_1.body)('vehicle.year')
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage('Invalid vehicle year'),
    (0, express_validator_1.body)('vehicle.insuranceDocument')
        .notEmpty()
        .withMessage('Vehicle insurance document is required'),
    (0, express_validator_1.body)('vehicle.inspectionCertificate')
        .notEmpty()
        .withMessage('Vehicle inspection certificate is required'),
    (0, express_validator_1.body)('vehicle.licensePlate')
        .notEmpty()
        .withMessage('License plate is required'),
    (0, express_validator_1.body)('banking.accountNumber')
        .notEmpty()
        .withMessage('Bank account number is required'),
    (0, express_validator_1.body)('banking.bankName').notEmpty().withMessage('Bank name is required'),
    (0, express_validator_1.body)('banking.sortCodeOrIBAN')
        .notEmpty()
        .withMessage('Sort code or IBAN is required'),
    (0, express_validator_1.body)('banking.tin').notEmpty().withMessage('TIN is required'),
    (0, express_validator_1.body)('banking.vatNumber')
        .optional()
        .notEmpty()
        .withMessage('VAT number cannot be empty'),
], validate_middleware_1.validateRequest, driver_controller_1.submitKyc);
router.get('/kyc', auth_middleware_1.authenticate, driver_controller_1.getKyc);
exports.default = router;
