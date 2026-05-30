"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const swaggerDocument = js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.resolve(__dirname, '../docs/swagger.yaml'), 'utf8'));
function createApp() {
    var _a;
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: ((_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(',').map((s) => s.trim())) || true,
        credentials: true,
    }));
    app.get('/', (_req, res) => res.send('node-aws API is running'));
    app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
    app.use('/assets', express_1.default.static(path_1.default.resolve(__dirname, '../assets')));
    app.use('/api', routes_1.default);
    app.use(error_middleware_1.errorHandler);
    return app;
}
