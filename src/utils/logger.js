"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.logger = {
    info: (message, meta) => {
        console.info(JSON.stringify({ level: 'info', timestamp: new Date().toISOString(), message, meta: meta || {} }));
    },
    warn: (message, meta) => {
        console.warn(JSON.stringify({ level: 'warn', timestamp: new Date().toISOString(), message, meta: meta || {} }));
    },
    error: (message, meta) => {
        console.error(JSON.stringify({ level: 'error', timestamp: new Date().toISOString(), message, meta: meta || {} }));
    },
    debug: (message, meta) => {
        console.debug(JSON.stringify({ level: 'debug', timestamp: new Date().toISOString(), message, meta: meta || {} }));
    },
};
