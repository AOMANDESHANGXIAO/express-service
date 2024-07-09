/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:26:58
 * @Description  : 讨论路由
*/

const express = require('express')

const router = express.Router()

const prefix = '/discuss'

const { queryAllDiscussion } = require('../../controller/discussion')

router.get('/queryTopic', queryAllDiscussion)

module.exports = {
  prefix,
  router,
}