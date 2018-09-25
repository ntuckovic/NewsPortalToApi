"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const Api_1 = require("./Api");
class App {
    constructor() {
        this.express = express();
        this.mountRoutes();
    }
    mountRoutes() {
        const router = express.Router();
        router.get('/sections', Api_1.sections);
        router.get('/frontpage', Api_1.sectionPage);
        router.get('/section/:section(([^\/-]+[\/-]+[^\/-]+|[a-zA-z0-9]+))', Api_1.sectionPage);
        this.express.use('/', router);
    }
}
exports.default = new App().express;
//# sourceMappingURL=App.js.map