/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 16:44:14
 * @Description  : 管理员创建讨论用
 */

const { getConnection } = require('../../db/conn')

/**
 *
 * @param {*} req req.body.topic_content, class_id, created_user_id
 * @param {*} res
 * @param {*} next
 */
async function createDiscussion(req, res, next) {
  const { topic_content, class_id, created_user_id } = req.body

  const connection = await getConnection()
  await connection.beginTransaction()

  // 插入讨论
  const insert_discuss_sql = `
  INSERT INTO discussion (topic_content, topic_for_class_id, created_user_id, created_time) 
  VALUES ('${topic_content}', ${class_id}, ${created_user_id}, NOW())
  `

  const new_discuss = await connection.execute(insert_discuss_sql)

  const new_discuss_id = new_discuss[0].insertId

  // 创建节点，讨论节点，小组节点
  const insert_topic_node_sql = `
  INSERT INTO node_table (content, type, class_id, topic_id, created_time)
  VALUES ('${topic_content}', 'topic', ${class_id}, ${new_discuss_id}, NOW())
  `

  await connection.execute(insert_topic_node_sql)

  // TODO:查询所有的小组节点并创建



}

module.exports = {
  createDiscussion,
}
