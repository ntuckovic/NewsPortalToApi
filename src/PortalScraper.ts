import * as cheerio from 'cheerio'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const FEED_POST_SELECTOR = process.env.FEED_POST_SELECTOR || '.td-big-grid-post, .td_module_wrap'
const FEED_TITLE_SELECTOR = process.env.FEED_TITLE_SELECTOR || '.entry-title'
const FEED_LINK_SELECTOR = process.env.FEED_LINK_SELECTOR || '[rel="bookmark"]'
const FEED_LEAD_SELECTOR = process.env.FEED_LEAD_SELECTOR || '.td-excerpt'
const POST_TITLE_SELECTOR = process.env.FEED_TITLE_SELECTOR || 'h1.entry-title'

const SECTIONS_SELECTOR = process.env.FEED_LEAD_SELECTOR || '#menu-glavni-1 > li'
const SUBSECTIONS_SELECTOR = process.env.SUBSECTIONS_SELECTOR || '.sub-menu > li' 

interface Image {
    src?: string
    title?: string
    alt?: string
}

interface Post {
    title?: string
    internal_url?: string
    original_url?: string
    lead?: string
    image?: Image,
    content?: string
}

interface Section {
    name: string
    internal_url: string
    original_url: string
    subsections?: Section[]
}

class PortalScraper {
    feedPostSelector: string
    feedTitleSelector: string
    feedLinkSelector: string
    feedLeadSelector: string
    sectionsSelector: string
    subsectionsSelector: string
    postTitleSelector: string
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
        this.postTitleSelector = POST_TITLE_SELECTOR
    }

    getInternalUrl(originalUrl: string, replacamentPath: string) {
        return originalUrl.replace(this.portalUrl, replacamentPath)
    } 

    getSection($section) {
        let sectionObj: Section = {
            'internal_url': this.getInternalUrl($section.find('a').attr('href'), `${this.baseUrl}/section`),
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

    getSections (body: string) {
        const $body = cheerio.load(body)
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

    getPosts (body: string) {
        const $body = cheerio.load(body)
        const $posts = $body(this.feedPostSelector)
        let posts = []

        $posts.each((index, post) => {
            let postObj: Post = {}
            let $img = $body(post).find('img')
            let $title = $body(post).find(this.feedTitleSelector)
            let $link = $body(post).find(this.feedLinkSelector)
            let $lead = $body(post).find(this.feedLeadSelector)

            postObj['title'] = $title.text()
            postObj['internal_url'] = this.getInternalUrl($link.attr('href'), `${this.baseUrl}/post`),
            postObj['ortginal_url'] = $link.attr('href')
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

    getPostDetail (body: string) {
        const $body = cheerio.load(body)
        const $title = $body(this.postTitleSelector)

        let postDetailObj: Post = {
            'title': $title.text()
        }

        return postDetailObj
    }
}

export default PortalScraper
