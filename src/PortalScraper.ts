import * as cheerio from 'cheerio'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const FEED_POST_SELECTOR = process.env.FEED_POST_SELECTOR || '.td-big-grid-post, .td_module_wrap'
const FEED_TITLE_SELECTOR = process.env.FEED_TITLE_SELECTOR || '.entry-title'
const FEED_LINK_SELECTOR = process.env.FEED_LINK_SELECTOR || '[rel="bookmark"]'
const FEED_LEAD_SELECTOR = process.env.FEED_LEAD_SELECTOR || '.td-excerpt'
const FEED_LABEL_SELECTOR = process.env.FEED_LABEL_SELECTOR || '[class^="nadnaslov"]'
const POST_TITLE_SELECTOR = process.env.POST_TITLE_SELECTOR || 'h1.entry-title'
const POST_LEAD_SELECTOR = process.env.POST_LEAD_SELECTOR || '.td-post-sub-title'
const POST_IMAGE_SELECTOR = process.env.POST_IMAGE_SELECTOR || '.td-post-featured-image'

const SECTIONS_SELECTOR = process.env.SECTIONS_SELECTOR || '#menu-glavni-1 > li'
const SUBSECTIONS_SELECTOR = process.env.SUBSECTIONS_SELECTOR || '.sub-menu > li'

interface Image {
    src: string
    title?: string
    alt?: string
    caption?: string
}

interface PostLight {
    title?: string
    internal_url?: string
    original_url?: string
    image?: Image
    label?: string
    lead?: string
}

interface Post extends PostLight {
    content?: any
}

interface Section {
    name: string
    internal_url: string
    original_url: string
    subsections?: Section[]
}

class PortalScraper {
    feedPostSelector: string = FEED_POST_SELECTOR
    feedTitleSelector: string = FEED_TITLE_SELECTOR
    feedLinkSelector: string = FEED_LINK_SELECTOR
    feedLeadSelector: string = FEED_LEAD_SELECTOR
    feedLabelSelector: string = FEED_LABEL_SELECTOR
    sectionsSelector: string = SECTIONS_SELECTOR
    subsectionsSelector: string = SUBSECTIONS_SELECTOR
    postTitleSelector: string = POST_TITLE_SELECTOR
    postLeadSelector: string = POST_LEAD_SELECTOR
    postImageSelector: string = POST_IMAGE_SELECTOR
    baseUrl: string = BASE_URL
    portalUrl: string

    constructor(portalUrl: string) {
        this.portalUrl = portalUrl
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

    getSections(body: string) {
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

    getPosts(body: string) {
        const $body = cheerio.load(body)
        const $posts = $body(this.feedPostSelector)
        let posts = []

        $posts.each((index, post) => {
            let postObj: PostLight = {}
            let $img = $body(post).find('img')
            let $title = $body(post).find(this.feedTitleSelector)
            let $link = $body(post).find(this.feedLinkSelector)
            let $lead = $body(post).find(this.feedLeadSelector)
            let $label = $body(post).find(this.feedLabelSelector)

            postObj['title'] = $title.text()
            postObj['internal_url'] = this.getInternalUrl($link.attr('href'), `${this.baseUrl}/post`)
            postObj['original_url'] = $link.attr('href')
            postObj['lead'] = $lead.text()
            postObj['label'] = $label.text()

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

    getPostDetail(body: string) {
        const $body = cheerio.load(body)
        const $title = $body(this.postTitleSelector)
        const $lead = $body(this.postLeadSelector)
        const $img = $body(this.postImageSelector)
        const $content = $body('.td-post-content')

        $content.find('p, img').each((i, elem) => {
            if (elem.name == 'p') {
                console.log(cheerio.load(elem).text());
            }
            else if (elem.name == 'img') {
                console.log(elem.attribs.src);
            }
        });

        let postDetailObj: Post = {
            'title': $title.text(),
            'lead': $lead.text(),
            'content': $content.text()
        }

        if ($img.length > 0) {
            postDetailObj['image'] = {
                'src': $img.find('img').attr('src'),
                'title': $img.find('img').attr('title'),
                'alt': $img.find('img').attr('alt'),
                'caption': $img.find('.wp-caption-text').text(),
            }
        }

        return postDetailObj
    }
}

export default PortalScraper
