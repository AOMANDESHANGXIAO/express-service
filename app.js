/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-07 20:01:59
 * @Description  : express server
 */

const express = require('express')
const { usePreHandlerMiddleware, useErrorMiddleware } = require('./middleware')
const useRouters = require('./apis/router')

const { port } = require('./cnf')

const app = express()

usePreHandlerMiddleware(app).then(() => {
  useRouters(app).then(() => {
    useErrorMiddleware(app)

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`)
    })
  })
})