"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const PortalScraper_1 = require("./PortalScraper");
const PORTAL_URL = process.env.PORTAL_URL;
const portalScraper = new PortalScraper_1.default(PORTAL_URL);
const frontPage = (req, res) => {
    request.get(PORTAL_URL, (error, response, body) => {
        let feed = portalScraper.getFeed(body);
        let respData = {
            'count': feed.posts.length,
            'data': feed
        };
        res.json(respData);
    });
};
exports.default = frontPage;
//# sourceMappingURL=FrontPage.js.map