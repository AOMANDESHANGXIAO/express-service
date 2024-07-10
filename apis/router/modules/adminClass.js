/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-10 11:06:23
 * @Description  : 控制班级路由
*/

const express = require('express')

const router = express.Router()

const prefix = '/admin/class'

const { createClass, dropClass, queryClassList } = require('../../controller/adminClass')

/* 创建班级*/
router.post('/create', createClass)

/* 删除班级 */
router.post('/drop', dropClass)

/* 查询班级列表 */
router.get('/list', queryClassList)


module.exports = {
  prefix,
  router,
}
