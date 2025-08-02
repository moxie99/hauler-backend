"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI_USER ||
    'mongodb://localhost:27017/haulage-user-service';
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => console.log('User Service: Connected to MongoDB'))
    .catch((err) => console.error('User Service: MongoDB connection error:', err));
// Mount routes
app.use('/api/users', user_routes_1.default);
const PORT = 3001;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
