import * as cheerio from 'cheerio'
import * as request from 'request'

const PORTAL_URL = process.env.PORTAL_URL
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
    name?: string
    url?: string,
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

    constructor () {
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
            'url': $section.find('a').attr('href'),
            'name': $section.find('a').first().text(),
        }

        return sectionObj
    }

    getSections ($body) {
        const $sections = $body(this.sectionsSelector)
        let sections = []

        $sections.each((index, section) => {
            let $section = $body(section)
            let sectionObj = this.getSection($section)

            let subsections = $section.find(this.subsectionsSelector)

            if (subsections.length > 0) {
                sectionObj['subsections'] = []
                subsections.each((index, subsection) => {
                    let $subsection = $body(subsection)
                    let subsectionObj = this.getSection($subsection)

                    sectionObj['subsections'].push(subsectionObj)
                })
            }

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


const frontPage = (req, res) => {
    interface Response {
        count: Number
        data: Feed
    }

    const portalScraper = new PortalScraper() 

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
