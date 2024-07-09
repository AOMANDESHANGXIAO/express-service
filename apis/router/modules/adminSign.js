/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 16:06:53
 * @Description  : 管理员专用路由
*/

const express = require('express')

const router = express.Router()

const prefix = '/admin/sign'

const { adminSignIn, adminSignUp } = require('../../controller/adminSign')


/* 管理员登录 */
router.post('/signin', adminSignIn)

/* 管理员注册 */
router.post('/signup', adminSignUp)


module.exports = {
  prefix: prefix,
  router,
}
