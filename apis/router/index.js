/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-07 20:24:28
 * @Description  : 读取modules文件夹下所有的路由
*/

const fs = require('fs')
const path = require('path')
const routerPath = __dirname + '/modules'

/**
 * 
 * @param {*} app：express instance 
 * @returns Promise
 */
async function useRouters(app) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(routerPath)) {
      // console.error('There is no modules folder\n')
      reject(new Error('There is no modules folder'))
    }

    fs.readdir(routerPath, async (err, files) => {
      if (err) {
        // console.error(err)
        reject()
      }
      try {
        await Promise.all(
          files.map(async file => {
            const { prefix, router } = require(path.join(routerPath, file))
            app.use(prefix, router)
            // console.log('✨Using router >>>', prefix)
          })
        )
        resolve()
      } catch (err) {
        // console.error('Something went wrong when using routers', err)
        reject()
      }
    })
  })
}

module.exports = useRouters
