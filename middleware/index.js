/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-07 21:31:40
 * @Description  : the middleware handler of the project
 */
const fs = require('fs')
const path = require('path')

const { notFound, errorHandler } = require('./modules/errorMiddleware')

const bodyParser = require('body-parser')
const cors = require('cors')

const middlewarePath = __dirname + '/modules'

function useCommonMiddleware(app) {
  app.use(bodyParser.json())
  app.use(cors())
}

/**
 *
 * @param {*} app
 * @returns
 * @description: use custom middleware in the modules folder
 */
async function useCustomMiddleware(app) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(middlewarePath)) {
      // console.error('There is no modules folder\n')
      reject(new Error('There is no modules folder'))
    }

    fs.readdir(middlewarePath, async (err, files) => {
      if (err) {
        // console.error(err)
        reject()
      }
      try {
        await Promise.all(
          files.map(async file => {
            const filePath = path.join(middlewarePath, file)
            if (path.basename(filePath) !== 'errorMiddleware.js') {
              const midllewareObj = require(filePath)
              Object.keys(midllewareObj).forEach(key => {
                // console.log('✨Using middleware >>>', key)
                app.use(midllewareObj[key])
              })
            }
          })
        )
        resolve()
      } catch (err) {
        // console.error('Something went wrong when using midlleware', err)
        reject()
      }
    })
  })
}

function usePreHandlerMiddleware(app) {
  useCommonMiddleware(app)
  return useCustomMiddleware(app)
}

function useErrorMiddleware(app) {
  app.use(notFound)
  app.use(errorHandler)
}

module.exports = {
  usePreHandlerMiddleware,
  useErrorMiddleware,
}
