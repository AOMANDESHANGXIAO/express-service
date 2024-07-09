/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 11:05:57
 * @Description  : flow控制器中的复杂sql查询
 */
const { getConnection } = require('../../db/conn')

/**
 *
 * @param {number} topic_id
 */
async function queryIdeaNodes(topic_id) {
  const connection = await getConnection()

  const sql = `
SELECT
	t1.id node_id,
	t1.content,
	t2.nickname,
	t3.group_color,
	t2.id 
FROM
	node_table t1
	LEFT JOIN student t2 ON t1.student_id = t2.id
	JOIN \`group\` t3 ON t3.id = t2.group_id 
WHERE
	t1.type = 'idea' 
	AND t1.topic_id = ${topic_id};
  `

  let [results] = await connection.execute(sql)

  return results.map(r => {
    return {
      node_id: r.node_id,
      content: r.content,
      username: r.nickname,
      group_color: r.group_color,
      student_id: r.id,
    }
  })
}

/**
 *
 * @param {number} topic_id
 * @param {object} nodeTypeObj
 */
async function queryTopicNode(topic_id, nodeTypeObj) {
  const connection = await getConnection()

  const sql = `
SELECT
	t1.id,
	t1.content 
FROM
	node_table t1 
WHERE
	t1.topic_id = ${topic_id} 
	AND t1.type = '${nodeTypeObj.topic}';`

  let [results] = await connection.execute(sql)

  return {
    id: String(results[0].id),
    type: nodeTypeObj.topic,
    data: {
      text: results[0].content,
    },
    position: {
      x: 0,
      y: 0,
    },
  }
}

/**
 *
 * @param {number} topic_id
 * @param {Object} nodeTypeObj
 */
async function queryGroupNode(topic_id, nodeTypeObj) {
  const connection = await getConnection()
  const sql = `
SELECT
	t1.id node_id,
	t1.content,
  t2.group_name,
  t2.group_color,
  t2.id 
FROM
	node_table t1
	JOIN \`group\` t2 ON t2.id = t1.group_id 
WHERE
	t1.type = '${nodeTypeObj.group}' 
	AND t1.topic_id = ${topic_id};
  `

  let [results] = await connection.execute(sql)
  return results.map(result => {
    return {
      node_id: result.node_id,
      content: result.content,
      group_name: result.group_name,
      group_color: result.group_color,
      group_id: result.id,
    }
  })
}

/**
 * 
 * @param {number} topic_id 
 */
async function queryEdgeNode(topic_id) {
  const connection = await getConnection()

  const sql = `
SELECT
	t1.id,
	t1.source,
	t1.target,
	t1.type 
FROM
	edge_table t1 
WHERE
	t1.topic_id = ${topic_id};
  `

  let [results] = await connection.execute(sql)

  return results
}
module.exports = {
  queryIdeaNodes,
  queryTopicNode,
  queryGroupNode,
  queryEdgeNode
}
