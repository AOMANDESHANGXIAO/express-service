/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:53:33
 * @Description  : flow路由的控制器
 */

const { getConnection } = require('../../db/conn')

const {
  queryIdeaNodes,
  queryTopicNode,
  queryGroupNode,
  queryEdgeNode,
} = require('../../crud/flow/query')

const nodeTypeObj = {
  topic: 'topic',
  idea: 'idea',
  group: 'group',
}

const edgeTypeObj = {
  approve: 'approve',
  reject: 'reject',
  group_to_discuss: 'group_to_discuss',
  idea_to_group: 'idea_to_group',
}

/**
 *
 * @param {number} req.query.topic_id
 * @param {*} res
 * @param {*} next
 */
async function queryFlowData(req, res, next) {
  try {
    const { topic_id } = req.query

    const idea_nodes = await queryIdeaNodes(topic_id)

    let res_node = idea_nodes.map(idea => {
      return {
        id: String(idea.node_id),
        type: nodeTypeObj.idea,
        data: {
          name: idea.username,
          id: idea.node_id,
          bgc: idea.group_color,
          student_id: idea.student_id,
        },
        position: {
          x: 0,
          y: 0,
        },
      }
    })

    const topic_node = await queryTopicNode(topic_id, nodeTypeObj)

    let group_nodes = await queryGroupNode(topic_id, nodeTypeObj)

    group_nodes = group_nodes.map(group => {
      return {
        id: String(group.node_id),
        type: nodeTypeObj.group,
        data: {
          groupName: group.group_name,
          groupConclusion: group.content,
          bgc: group.group_color,
          group_id: group.group_id,
        },
        position: {
          x: 0,
          y: 0,
        },
      }
    })

    res_node = res_node.concat(group_nodes)

    let res_edge = await queryEdgeNode(topic_id)

    res_edge = res_edge.map(edge => {
      return {
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        _type: edge.type,
        animated: true,
      }
    })

    const data = {
      nodes: [...res_node, topic_node],
      edges: res_edge,
    }

    res.responseSuccess(data, '请求成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 *
 * @param {number} req.query.node_id
 * @param {*} res
 * @param {*} next
 */
async function queryContentData(req, res, next) {
  const nide_id = req.query.node_id

  try {
    const connection = await getConnection()

    const sql = `
SELECT
  t1.content
FROM
  node_table t1
WHERE
  t1.id = ${nide_id};`

    let [results] = await connection.execute(sql)

    res.responseSuccess({ content: results[0]?.content }, '请求成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 *
 * @param {*} req req.body.topic_id req.body.student_id req.body.content
 * @param {*} res
 * @param {*} next
 */
async function proposeIdea(req, res, next) {
  try {
    const { topic_id, student_id, content } = req.body

    const connection = await getConnection()

    await connection.beginTransaction()

    const add_node_sql = `
INSERT INTO
  node_table
  (topic_id, type, content, student_id, created_time)
VALUES
  (${topic_id}, '${nodeTypeObj.idea}', '${content}', '${student_id}', now());`

    const insert_node_id = await connection
      .execute(add_node_sql)
      .then(results => {
        return results[0].insertId
      })

    const query_group_node_id_sql = `
SELECT
	t1.id
FROM
	node_table t1
	JOIN \`group\` t2 ON t1.group_id = t2.id
	JOIN student t3 ON t3.group_id = t2.id 
WHERE
	t3.id = ${student_id} and t1.type = 'group' and t1.topic_id = ${topic_id};
    `

    const group_node = await connection.execute(query_group_node_id_sql)

    // console.log(group_node[0])

    const group_node_id = group_node[0][0]?.id

    const add_edge_sql = `
INSERT INTO
  edge_table
  (source, target, type, topic_id)
VALUES
  (${insert_node_id}, ${group_node_id}, '${edgeTypeObj.idea_to_group}', ${topic_id});`

    await connection.execute(add_edge_sql)

    await connection.commit()

    res.responseSuccess(null, '新增成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败')
  }
}
module.exports = {
  queryFlowData,
  queryContentData,
  proposeIdea,
}
