"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const port = process.env.PORT || 8585;
const app = (0, app_1.createApp)();
const server = (0, http_1.createServer)(app);
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
