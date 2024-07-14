const express = require('express')

const router = express.Router()

const prefix = '/user'

const {
  signin,
  signup,
  queryUserCollaborationData,
} = require('../../controller/user')

/* 登录 */
router.post('/signin', signin)

/* 注册 */
router.post('/signup', signup)

/**
 * 查询个人的协作情况
 */
router.get('/collInfo', queryUserCollaborationData)

module.exports = {
  prefix,
  router,
}
