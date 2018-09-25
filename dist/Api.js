"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const PortalScraper_1 = require("./PortalScraper");
const PORTAL_URL = process.env.PORTAL_URL;
const portalScraper = new PortalScraper_1.default(PORTAL_URL);
exports.sections = (req, res) => {
    request.get(PORTAL_URL, (error, response, body) => {
        let sections = portalScraper.getSections(body);
        let respData = {
            'count': sections.length,
            'data': sections
        };
        res.json(respData);
    });
};
exports.sectionPage = (req, res) => {
    const sectionPath = req.params.section || '';
    request.get(`${PORTAL_URL}/${sectionPath}`, (error, response, body) => {
        let feed = portalScraper.getPosts(body);
        let respData = {
            'count': feed.length,
            'data': feed
        };
        res.json(respData);
    });
};
//# sourceMappingURL=Api.js.map