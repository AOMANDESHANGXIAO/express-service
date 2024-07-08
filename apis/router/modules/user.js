const express = require('express')

const router = express.Router()

const prefix = '/user'

const { signin, signup } = require('../../controller/user')

/* 登录 */
router.post('/signin', signin)

/* 注册 */
router.post('/signup', signup)


module.exports = {
  prefix,
  router,
}
