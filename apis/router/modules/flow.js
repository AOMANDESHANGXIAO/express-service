/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:54:05
 * @Description  : flow路由
 */

const express = require('express')

const router = express.Router()

const prefix = '/flow'

const {
  queryFlowData,
  queryContentData,
  proposeIdea,
  replyIdea
} = require('../../controller/flow')

/* 查询讨论数据包括edge和node */
router.get('/query', queryFlowData)

/* 查询节点的内容 */
router.get('/query_content', queryContentData)

/* 提出想法 */
router.post('/propose_idea', proposeIdea)

/* 回复想法 */
router.post('/reply_idea', replyIdea)

module.exports = {
  prefix,
  router,
}
