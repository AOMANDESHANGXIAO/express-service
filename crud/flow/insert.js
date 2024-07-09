/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 13:54:26
 * @Description  : 插入
 */

// const { getConnection } = require('../../db/conn')

/**
 * @param {object} connection the mysql conncetion
 * @param {number} topic_id
 * @param {string} type
 * @param {string} content
 * @param {number} student_id
 * @returns {number} the insert node id
 */
async function addNode(connection, topic_id, type, content, student_id) {
  const sql = `
INSERT INTO
  node_table
  (topic_id, type, content, student_id, created_time)
VALUES
  (${topic_id}, '${type}', '${content}', '${student_id}', now());`

  const insert_node = await connection.execute(sql)

  const insert_node_id = insert_node[0].insertId

  return insert_node_id
}

/**
 *
 * @param {object} connection
 * @param {number} source
 * @param {number} target
 * @param {string} type
 * @param {number} topic_id
 */
async function addEdge(connection, source, target, type, topic_id) {
  const sql = `
INSERT INTO
  edge_table
  (source, target, type, topic_id)
VALUES
  (${source}, ${target}, '${type}', ${topic_id});`

  await connection.execute(sql)
}

module.exports = { addNode, addEdge }
