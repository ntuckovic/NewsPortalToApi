import * as express from 'express'

import frontPage from './FrontPage'

class App {
  public express

  constructor () {
    this.express = express()
    this.mountRoutes()
  }

  private mountRoutes (): void {
    const router = express.Router()
    
    router.get('/frontpage', frontPage)
    
    this.express.use('/', router)
  }
}

export default new App().express
