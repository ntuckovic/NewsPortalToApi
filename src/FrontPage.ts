import * as cheerio from 'cheerio'
import * as request from 'request'

const PORTAL_URL = process.env.PORTAL_URL
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const FEED_POST_SELECTOR = process.env.FEED_POST_SELECTOR || '.td-big-grid-post, .td_module_wrap'
const FEED_TITLE_SELECTOR = process.env.FEED_TITLE_SELECTOR || '.entry-title'
const FEED_LINK_SELECTOR = process.env.FEED_LINK_SELECTOR || '[rel="bookmark"]'
const FEED_LEAD_SELECTOR = process.env.FEED_LEAD_SELECTOR || '.td-excerpt'

const SECTIONS_SELECTOR = process.env.FEED_LEAD_SELECTOR || '#menu-glavni-1 > li'
const SUBSECTIONS_SELECTOR = process.env.SUBSECTIONS_SELECTOR || '.sub-menu > li' 

interface Image {
    src?: string
    title?: string
    alt?: string
}

interface Post {
    title?: string
    url?: string
    lead?: string
    image?: Image
}

interface Section {
    name: string
    internal_url: string
    original_url: string
    subsections?: Section[]
}

interface Feed {
    sections: Section[]
    posts: Post[]
}

class PortalScraper {
    feedPostSelector: string
    feedTitleSelector: string
    feedLinkSelector: string
    feedLeadSelector: string
    sectionsSelector: string
    subsectionsSelector: string
    baseUrl: string
    portalUrl: string

    constructor (portalUrl: string) {
        this.portalUrl = portalUrl
        this.baseUrl = BASE_URL
        this.feedPostSelector = FEED_POST_SELECTOR
        this.feedTitleSelector = FEED_TITLE_SELECTOR
        this.feedLinkSelector = FEED_LINK_SELECTOR
        this.feedLeadSelector = FEED_LEAD_SELECTOR
        this.sectionsSelector = SECTIONS_SELECTOR
        this.subsectionsSelector = SUBSECTIONS_SELECTOR
    }

    getFeed (body: string) {
        const $body = cheerio.load(body)

        let feed: Feed = {
            'sections': this.getSections($body),
            'posts': this.getPosts($body)
        }

        return feed
    }

    getSection($section) {
        let sectionObj: Section = {
            'internal_url': $section.find('a').attr('href').replace(this.portalUrl, `${this.baseUrl}/section`),
            'original_url': $section.find('a').attr('href'),
            'name': $section.find('a').first().text(),
        }

        return sectionObj
    }

    getSubsections($body, $section) {
        let subsections = $section.find(this.subsectionsSelector)
        let subectionsArray = []

        if (subsections.length > 0) {
            subsections.each((index, subsection) => {
                let $subsection = $body(subsection)
                let subsectionObj = this.getSection($subsection)

                subectionsArray.push(subsectionObj)
            })
        }

        return subectionsArray
    }

    getSections ($body) {
        const $sections = $body(this.sectionsSelector)
        let sections = []

        $sections.each((index, section) => {
            let $section = $body(section)
            let sectionObj = this.getSection($section)

            sectionObj['subsections'] = this.getSubsections($body, $section)

            sections.push(sectionObj)
        })

        return sections
    }

    getPosts ($body) {
        const $posts = $body(this.feedPostSelector)
        let posts = []

        $posts.each((index, post) => {
            let postObj: Post = {}
            let $img = $body(post).find('img')
            let $title = $body(post).find(this.feedTitleSelector)
            let $link = $body(post).find(this.feedLinkSelector)
            let $lead = $body(post).find(this.feedLeadSelector)

            postObj['title'] = $title.text()
            postObj['url'] = $link.attr('href')
            postObj['lead'] = $lead.text()

            if ($img.length > 0) {
                postObj['image'] = {
                    'src': $img.attr('src'),
                    'title': $img.attr('title'),
                    'alt': $img.attr('alt')
                }
            }

            posts.push(postObj)
        })

        return posts
    }
}

const portalScraper = new PortalScraper(PORTAL_URL) 

const frontPage = (req, res) => {
    interface Response {
        count: Number
        data: Feed
    }

    request.get(PORTAL_URL, (error, response, body) => {
        let feed = portalScraper.getFeed(body)

        let respData: Response = {
            'count': feed.posts.length,
            'data': feed
        }

        res.json(respData)
    })
}

export default frontPage;
