/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 17:22:43
 * @Description  : the router of the group
 */

const express = require('express')

const router = express.Router()

const prefix = '/group'

const {
  createGroup,
  joinGroup,
  queryGroupCollaborationData,
  queryStudentGroup,
  queryMemberData
} = require('../../controller/group')

/* 创建小队 */
router.post('/create', createGroup)

/* 加入小队 */
router.post('/join', joinGroup)

/* 查询小队协作数据 */
router.get('/query_collaboration_data', queryGroupCollaborationData)

/* 查询学生团队 */
router.get('/query', queryStudentGroup)

/* 查询团队成员的协作数据 */
router.get('/query_member_data', queryMemberData)

module.exports = {
  prefix,
  router,
}
