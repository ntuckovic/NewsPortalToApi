import * as request from 'request'
import PortalScraper from './PortalScraper'

const PORTAL_URL = process.env.PORTAL_URL
const portalScraper = new PortalScraper(PORTAL_URL)

interface Response {
    count: Number
    data: Array<Object>
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

export const sectionPage = (req, res) => {
    const sectionPath = req.params.section || ''

    request.get(`${PORTAL_URL}/${sectionPath}`, (error, response, body) => {
        let feed = portalScraper.getPosts(body)

        let respData: Response = {
            'count': feed.length,
            'data': feed
        }

        res.json(respData)
    })
}
