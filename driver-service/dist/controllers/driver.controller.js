"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKyc = exports.submitKyc = exports.updateStatus = exports.updateProfile = exports.getProfile = exports.login = exports.getPendingDrivers = exports.resendOtp = exports.confirmOtp = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const driver_model_1 = __importDefault(require("../models/driver.model"));
const email_1 = require("../utils/email");
const otp_model_1 = __importDefault(require("../models/otp.model"));
const pendingDriver_model_1 = __importDefault(require("../models/pendingDriver.model"));
const generateOtp = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, phone } = req.body;
        const existingDriver = yield driver_model_1.default.findOne({ email });
        if (existingDriver) {
            return res.status(409).json({
                statusCode: '06',
                error: 'Email already registered',
            });
        }
        const existingPending = yield pendingDriver_model_1.default.findOne({ email });
        if (existingPending) {
            return res.status(409).json({
                statusCode: '02',
                message: 'Email awaiting confirmation, please verify OTP',
                email,
            });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 8);
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        const lastSent = new Date();
        yield new pendingDriver_model_1.default({
            name,
            email,
            password: hashedPassword,
            phone,
            registrationStatus: 'unconfirmed',
        }).save();
        yield otp_model_1.default.create({ email, otp, expiresAt, lastSent, isValid: true });
        yield (0, email_1.sendOtpEmail)(email, otp);
        res.status(200).json({
            statusCode: '00',
            message: 'OTP sent to email',
            email,
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error during OTP generation',
        });
    }
});
exports.register = register;
const confirmOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const otpRecord = yield otp_model_1.default.findOne({ email, otp, isValid: true });
        if (!otpRecord) {
            return res.status(400).json({
                statusCode: '01',
                error: 'Invalid OTP',
            });
        }
        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                statusCode: '01',
                error: 'OTP expired, please request a new one',
            });
        }
        const pendingDriver = yield pendingDriver_model_1.default.findOne({ email });
        if (!pendingDriver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Pending registration not found',
            });
        }
        const driver = new driver_model_1.default({
            name: pendingDriver.name,
            email,
            password: pendingDriver.password,
            phone: pendingDriver.phone,
            vehicleType: '',
            licenseNumber: '',
            status: 'pending',
            kycStatus: '',
        });
        yield driver.save();
        yield otp_model_1.default.deleteOne({ email });
        yield pendingDriver_model_1.default.deleteOne({ email });
        res.status(201).json({
            statusCode: '00',
            message: 'Driver registered successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error during OTP confirmation',
        });
    }
});
exports.confirmOtp = confirmOtp;
const resendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const pendingDriver = yield pendingDriver_model_1.default.findOne({ email });
        if (!pendingDriver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'No pending registration found for this email',
            });
        }
        const otpRecord = yield otp_model_1.default.findOne({ email, isValid: true });
        if (otpRecord && otpRecord.expiresAt >= new Date()) {
            const timeSinceLastSent = (new Date().getTime() - otpRecord.lastSent.getTime()) / 1000;
            if (timeSinceLastSent < 60) {
                return res.status(429).json({
                    statusCode: '03',
                    error: 'Please wait before requesting another OTP',
                    resendIn: Math.ceil(60 - timeSinceLastSent),
                });
            }
        }
        const otp = generateOtp();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        const lastSent = new Date();
        yield otp_model_1.default.findOneAndUpdate({ email }, { email, otp, expiresAt, lastSent, isValid: true }, { upsert: true, new: true });
        yield (0, email_1.sendOtpEmail)(email, otp);
        res.status(200).json({
            statusCode: '00',
            message: 'New OTP sent to your email',
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error during OTP resend',
        });
    }
});
exports.resendOtp = resendOtp;
const getPendingDrivers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.role !== 'admin') {
            return res.status(403).json({
                statusCode: '04',
                error: 'Only admins can access pending drivers',
            });
        }
        const pendingDrivers = yield pendingDriver_model_1.default.find({
            registrationStatus: 'unconfirmed',
        }).select('name email phone createdAt');
        res.json({
            statusCode: '00',
            data: pendingDrivers,
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error fetching pending drivers',
        });
    }
});
exports.getPendingDrivers = getPendingDrivers;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const driver = yield driver_model_1.default.findOne({ email });
        const pendingDriver = yield pendingDriver_model_1.default.findOne({ email });
        if (!driver && !pendingDriver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Invalid credentials. Please click on create new account button below',
            });
        }
        if (!driver && pendingDriver) {
            const otp = generateOtp();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
            const lastSent = new Date();
            yield otp_model_1.default.findOneAndUpdate({ email }, { email, otp, expiresAt, lastSent, isValid: true }, { upsert: true, new: true });
            yield (0, email_1.sendOtpEmail)(email, otp);
            return res.status(400).json({
                statusCode: '02',
                message: 'New OTP sent to email, please confirm your email',
                email,
            });
        }
        if (driver) {
            const isMatch = yield bcryptjs_1.default.compare(password, driver.password);
            if (!isMatch) {
                return res.status(401).json({
                    statusCode: '04',
                    error: 'Invalid credentials. Please enter the right password, and try again',
                });
            }
            const token = jsonwebtoken_1.default.sign({ userId: driver._id, role: 'driver' }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
            return res.json({
                statusCode: '00',
                data: {
                    token,
                    driver: {
                        id: driver._id,
                        name: driver.name,
                        email: driver.email,
                        phone: driver.phone,
                        vehicleType: driver.vehicleType,
                        licenseNumber: driver.licenseNumber,
                        status: driver.status,
                        kycStatus: driver.kyc.kycStatus,
                    },
                },
            });
        }
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error during login',
        });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('------>', req);
    try {
        const driver = yield driver_model_1.default.findById(req.userId).select('-password');
        console.log('=====>>', driver);
        if (!driver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Driver not found',
            });
        }
        res.json({
            statusCode: '00',
            data: Object.assign(Object.assign({}, driver.toJSON()), { kycStatus: driver.kyc.kycStatus }),
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error fetching profile',
        });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phone, vehicleType, licenseNumber } = req.body;
        if (licenseNumber) {
            const existingLicense = yield driver_model_1.default.findOne({
                'kyc.licenseNumber': licenseNumber,
                _id: { $ne: req.userId },
            });
            if (existingLicense) {
                return res.status(409).json({
                    statusCode: '06',
                    error: 'License number already exists',
                });
            }
        }
        const driver = yield driver_model_1.default.findByIdAndUpdate(req.userId, { name, phone, vehicleType, licenseNumber }, { new: true, runValidators: true }).select('-password');
        if (!driver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Driver not found',
            });
        }
        res.json({
            statusCode: '00',
            data: driver,
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error updating profile',
        });
    }
});
exports.updateProfile = updateProfile;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.role !== 'admin') {
            return res.status(403).json({
                statusCode: '04',
                error: 'Only admins can update driver status',
            });
        }
        const { driverId, status } = req.body;
        const driver = yield driver_model_1.default.findByIdAndUpdate(driverId, { status }, { new: true, runValidators: true }).select('-password');
        if (!driver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Driver not found',
            });
        }
        res.json({
            statusCode: '00',
            data: driver,
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error updating driver status',
        });
    }
});
exports.updateStatus = updateStatus;
const submitKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driver = yield driver_model_1.default.findById(req.userId);
        if (!driver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Driver not found',
            });
        }
        if (driver.kyc.kycStatus === 'verified') {
            return res.status(400).json({
                statusCode: '01',
                error: 'KYC already verified',
            });
        }
        const kycData = req.body;
        if (kycData.licenseNumber) {
            const existingLicense = yield driver_model_1.default.findOne({
                'kyc.licenseNumber': kycData.licenseNumber,
                _id: { $ne: req.userId },
            });
            if (existingLicense) {
                return res.status(409).json({
                    statusCode: '06',
                    error: 'License number already exists',
                });
            }
        }
        driver.kyc = Object.assign(Object.assign({}, kycData), { email: driver.email, phone: driver.phone, kycStatus: 'pending' });
        driver.vehicleType = kycData.vehicleType;
        driver.licenseNumber = kycData.licenseNumber;
        yield driver.save();
        res.json({
            statusCode: '00',
            message: 'KYC details submitted successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error submitting KYC',
        });
    }
});
exports.submitKyc = submitKyc;
const getKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const driver = yield driver_model_1.default.findById(req.userId).select('kyc');
        if (!driver) {
            return res.status(404).json({
                statusCode: '05',
                error: 'Driver not found',
            });
        }
        res.json({
            statusCode: '00',
            data: driver.kyc,
        });
    }
    catch (error) {
        res.status(500).json({
            statusCode: '01',
            error: 'Internal server error fetching KYC',
        });
    }
});
exports.getKyc = getKyc;
