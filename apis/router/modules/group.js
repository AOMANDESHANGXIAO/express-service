/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 17:22:43
 * @Description  : the router of the group
 */

const express = require('express')

const router = express.Router()

const prefix = '/group'

const { createGroup } = require('../../controller/group')

/* 创建小队 */
router.post('/create', createGroup)

module.exports = {
  prefix,
  router,
}
