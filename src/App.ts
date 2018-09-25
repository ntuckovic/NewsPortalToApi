import * as express from 'express'

import { sections, frontPage, sectionPage } from './Api'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    
    router.get('/sections', sections)
    router.get('/frontpage', sectionPage)
    router.get('/section/:section(([^\/-]+[\/-]+[^\/-]+|[a-zA-z0-9]+))', sectionPage)
    
    this.express.use('/', router)
  }
}

export default new App().express
