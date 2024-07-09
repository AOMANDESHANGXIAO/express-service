/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:40:49
 * @Description  : 班级查询路由
*/

const express = require('express');

const router = express.Router();

const prefix = '/classroom';

const { queryClassList } = require('../../controller/classroom');


router.get('/queryClassroomList', queryClassList);

module.exports = {
  prefix,
  router
}
