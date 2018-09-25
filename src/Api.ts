import * as request from 'request'
import PortalScraper from './PortalScraper'

const PORTAL_URL = process.env.PORTAL_URL
const portalScraper = new PortalScraper(PORTAL_URL)

interface Response {
    count: Number
    data: Array<Object>
}

interface ResponseDetail {
    data: Object
}

export const sections = (req, res) => {
    request.get(PORTAL_URL, (error, response, body) => {
        let sections = portalScraper.getSections(body)

        let respData: Response = {
            'count': sections.length,
            'data': sections
        }

        res.json(respData)
    })
}

export const feed = (req, res) => {
    const feedPath = req.params.feed || ''

    request.get(`${PORTAL_URL}/${feedPath}`, (error, response, body) => {
        let feed = portalScraper.getPosts(body)

        let respData: Response = {
            'count': feed.length,
            'data': feed
        }

        res.json(respData)
    })
}

export const post = (req, res) => {
    const postPath = req.params.post

    request.get(`${PORTAL_URL}/${postPath}`, (error, response, body) => {
        let postDetail = portalScraper.getPostDetail(body)

        let respData: ResponseDetail = {
            'data': postDetail
        }

        res.json(respData)
    })
}
