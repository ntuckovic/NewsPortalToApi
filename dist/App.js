"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const FrontPage_1 = require("./FrontPage");
class App {
    constructor() {
        this.express = express();
        this.mountRoutes();
    }
    mountRoutes() {
        const router = express.Router();
        router.get('/frontpage', FrontPage_1.default);
        this.express.use('/', router);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map