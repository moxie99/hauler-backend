"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const DriverSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { type: String },
    licenseNumber: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'suspended'],
        default: 'pending',
    },
    kyc: {
        dateOfBirth: { type: Date },
        residentialAddress: { type: String },
        nin: { type: String },
        vehicleType: { type: String },
        licenseNumber: { type: String },
        photoId: { type: String },
        selfie: { type: String },
        driverLicense: {
            number: { type: String },
            category: { type: String },
            issueDate: { type: Date },
            expiryDate: { type: Date },
        },
        vehicle: {
            registrationDocument: { type: String },
            make: { type: String },
            model: { type: String },
            year: { type: Number },
            insuranceDocument: { type: String },
            inspectionCertificate: { type: String },
            licensePlate: { type: String },
        },
        banking: {
            accountNumber: { type: String },
            bankName: { type: String },
            sortCodeOrIBAN: { type: String },
            tin: { type: String },
            vatNumber: { type: String },
        },
        kycStatus: {
            type: String,
            enum: ['incomplete', 'pending', 'verified', 'rejected'],
            default: 'incomplete',
        },
    },
});
// Remove existing index on licenseNumber if it exists
DriverSchema.index({ licenseNumber: 1 }, { unique: false, sparse: false });
// Ensure unique index on kyc.licenseNumber when set
DriverSchema.index({ 'kyc.licenseNumber': 1 }, { unique: true, sparse: true });
exports.default = mongoose_1.default.model('Driver', DriverSchema);
