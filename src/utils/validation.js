"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMissingFieldDetails = buildMissingFieldDetails;
function buildMissingFieldDetails(payload, requiredFields) {
    const details = [];
    for (const field of requiredFields) {
        const value = payload[field];
        if (value === undefined || value === null || value === '') {
            details.push({
                field,
                message: `${field} is required`,
                code: 'REQUIRED_FIELD_MISSING',
            });
        }
    }
    return details;
}
