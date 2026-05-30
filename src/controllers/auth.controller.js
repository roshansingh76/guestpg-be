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
exports.login = login;
exports.changePassword = changePassword;
exports.getProfile = getProfile;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const user_service_1 = require("../services/user.service");
const logger_1 = require("../utils/logger");
const response_1 = require("../utils/response");
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
function jwtSecret() {
    return process.env.JWT_SECRET || 'dev-secret-change-me';
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const parsed = loginSchema.safeParse(req.body);
            if (!parsed.success)
                return (0, response_1.sendBadRequest)(res, 'Invalid input', parsed.error.issues);
            const { email, password } = parsed.data;
            const user = yield user_service_1.UserService.authenticateUser(email.toLowerCase(), password);
            if (!user)
                return (0, response_1.sendError)(res, 'Invalid email or password', 'UNAUTHORIZED', [], 401);
            const token = jsonwebtoken_1.default.sign({
                sub: user.id,
                role: user.role,
                email: user.email,
                pgId: (_a = user.pgId) !== null && _a !== void 0 ? _a : null,
                pgIds: user.pgIds || [],
            }, jwtSecret(), { expiresIn: '7d' });
            return (0, response_1.sendSuccess)(res, { token, user });
        }
        catch (error) {
            logger_1.logger.error('Login failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Login failed');
        }
    });
}
function changePassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body;
            const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub;
            if (!userId)
                return (0, response_1.sendError)(res, 'Authentication required', 'UNAUTHORIZED', [], 401);
            if (!currentPassword || !newPassword || !confirmPassword)
                return (0, response_1.sendBadRequest)(res, 'All password fields are required');
            if (newPassword !== confirmPassword)
                return (0, response_1.sendBadRequest)(res, 'New password and confirm password do not match');
            if (newPassword.length < 8)
                return (0, response_1.sendBadRequest)(res, 'Password must be at least 8 characters long');
            const user = yield user_service_1.UserService.getUserById(Number(userId));
            if (!user)
                return (0, response_1.sendNotFound)(res, 'User not found');
            yield user_service_1.UserService.updateUser(Number(userId), { password: newPassword });
            return (0, response_1.sendSuccess)(res, { success: true });
        }
        catch (error) {
            logger_1.logger.error('Change password failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Unable to change password');
        }
    });
}
function getProfile(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.sub;
            if (!userId)
                return (0, response_1.sendError)(res, 'Authentication required', 'UNAUTHORIZED', [], 401);
            const user = yield user_service_1.UserService.getUserById(Number(userId));
            if (!user)
                return (0, response_1.sendNotFound)(res, 'User not found');
            return (0, response_1.sendSuccess)(res, user);
        }
        catch (error) {
            logger_1.logger.error('Get profile failed', { error });
            return (0, response_1.sendError)(res, (error === null || error === void 0 ? void 0 : error.message) || 'Unable to fetch profile');
        }
    });
}
