"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRequired = authRequired;
exports.hasPGAccess = hasPGAccess;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function jwtSecret() {
    return process.env.JWT_SECRET || 'dev-secret-change-me';
}
function authRequired(req, res, next) {
    const header = req.headers.authorization;
    const token = (header === null || header === void 0 ? void 0 : header.startsWith('Bearer ')) ? header.slice(7) : null;
    if (!token)
        return res.status(401).json({ message: 'Missing token' });
    try {
        const payload = jsonwebtoken_1.default.verify(token, jwtSecret());
        req.auth = payload;
        return next();
    }
    catch (_a) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
function hasPGAccess(auth, pgId) {
    if (auth.role === 'admin' || auth.role === 'super_admin')
        return true;
    if (!auth.pgIds || auth.pgIds.length === 0)
        return true;
    return auth.pgIds.includes(pgId) || auth.pgId === pgId;
}
function requireRole(...roles) {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth || !roles.includes(auth.role))
            return res.status(403).json({ message: 'Forbidden' });
        return next();
    };
}
