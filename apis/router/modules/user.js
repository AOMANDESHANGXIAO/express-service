const express = require('express')

const router = express.Router()

const prefix = '/user'

const { signin } = require('../../controller/user')

/**
 * @description: 登录
 */
router.post('/signin', signin)

module.exports = {
  prefix,
  router,
}
