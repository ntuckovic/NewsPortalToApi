import * as express from 'express'

import { sections, feed, post } from './Api'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    
    router.get('/sections', sections)
    router.get('/frontpage', feed)
    router.get('/feed/:feed(([^\/-]+[\/-]+[^\/-]+|[a-zA-z0-9]+))', feed)
    router.get('/post/:post', post)
    
    this.express.use('/', router)
  }
}

export default new App().express
