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
exports.feed = (req, res) => {
    const feedPath = req.params.feed || '';
    request.get(`${PORTAL_URL}/${feedPath}`, (error, response, body) => {
        let feed = portalScraper.getPosts(body);
        let respData = {
            'count': feed.length,
            'data': feed
        };
        res.json(respData);
    });
};
exports.post = (req, res) => {
    const postPath = req.params.post;
    request.get(`${PORTAL_URL}/${postPath}`, (error, response, body) => {
        let postDetail = portalScraper.getPostDetail(body);
        let respData = {
            'data': postDetail
        };
        res.json(respData);
    });
};
//# sourceMappingURL=Api.js.map