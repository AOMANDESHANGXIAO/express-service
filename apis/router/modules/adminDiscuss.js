/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 16:44:26
 * @Description  : 管理员创建讨论
*/

const express = require('express')

const router = express.Router()

const prefix = '/admin/discuss'

const { createDiscussion } = require('../../controller/adminDiscuss')

/* 创建讨论 */
router.post('/create', createDiscussion)

module.exports = {
  prefix,
  router,
}