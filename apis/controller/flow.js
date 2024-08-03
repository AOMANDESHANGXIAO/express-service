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

const { addNode, addEdge, createNode } = require('../../crud/flow/insert')

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
        animated: false,
      }
    })

    const data = {
      nodes: [...res_node, topic_node],
      edges: res_edge,
    }

    res.responseSuccess(data, '请求成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 *
 * @param {number} req.query.node_id
 * @param {*} res
 * @param {*} next
 * @deprecated
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
    // console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 *
 * @param {*} nodes
 * @param {number} arguKey
 * @param {number} version
 * @returns string
 */
const generateArgunodeInsertSql = (nodes, arguKey, version) => {
  let sql = `INSERT INTO argunode (type, content, arguKey, version, arguId) VALUES`

  nodes.forEach((node, index) => {
    sql += `('${node.data._type}', '${node.data.inputValue}', ${arguKey}, ${version}, '${node.id}')`
    if (index < nodes.length - 1) {
      sql += ','
    }
  })

  sql += ';'

  return sql
}

/**
 *
 * @param {*} edges
 * @param {number} arguKey
 * @param {number} version
 * @returns string
 */
const generateArguedgeInsertSql = (edges, arguKey, version) => {
  let sql = `INSERT INTO arguedge (type, source, target, arguKey, version, arguId) VALUES`

  edges.forEach((edge, index) => {
    sql += `('${edge._type}', '${edge.source}', '${edge.target}', '${arguKey}', ${version}, '${edge.id}')`
    if (index < edges.length - 1) {
      sql += ','
    }
  })

  sql += ';'

  return sql
}

/**
 *
 * @param {*} req req.body.topic_id req.body.student_id rea,body.argument
 * argument: {
 *    nodes: Array<{
 * id: string
 * data: {
 *  inputValue: string
 * _type: string
 * }
 * type: "element"}>
 * ,
 *    edges: Array<{
 * id: string
 * source: string
 * target: string
 * _type: string
 * }
 * }
 * @param {*} res
 * @param {*} next
 */
async function proposeIdea(req, res, next) {
  try {
    const { topic_id, student_id, nodes, edges } = req.body

    const connection = await getConnection()

    await connection.beginTransaction()

    // 1. 插入idea节点到node_table表中
    // createNode会插入一个新节点到node_table表中，并返回插入的id
    const arguKey = await createNode(
      connection,
      topic_id,
      nodeTypeObj.idea,
      student_id
    )

    // 2. 遍历根据前端传递的nodes和edges，插入到argunode和arguedge表中
    const insert_node_sql = generateArgunodeInsertSql(nodes, arguKey, 1)

    const insert_edge_sql = generateArguedgeInsertSql(edges, arguKey, 1)

    await connection.execute(insert_node_sql)
    // console.log('1')

    await connection.execute(insert_edge_sql)
    // console.log('2')

    // 3. 将idea和group连接起来
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

    const group_node_id = group_node[0][0]?.id

    await addEdge(
      connection,
      arguKey,
      group_node_id,
      edgeTypeObj.idea_to_group,
      topic_id
    )

    // console.log('3')

    await connection.commit()

    res.responseSuccess(null, '新增成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败'+String(err))
  }
}

/**
 *
 * @param {*} req req.body.topic_id student_id content reply_to reply_type
 * @param {*} res
 * @param {*} next
 */
async function replyIdea(req, res, next) {
  try {
    const { topic_id, student_id, content, reply_to, reply_type } = req.body
    const connection = await getConnection()

    await connection.beginTransaction()

    const insert_node_id = await addNode(
      connection,
      topic_id,
      nodeTypeObj.idea,
      content,
      student_id
    )

    const new_edge_type = reply_type ? edgeTypeObj.approve : edgeTypeObj.reject

    await addEdge(connection, insert_node_id, reply_to, new_edge_type, topic_id)

    await connection.commit()
    res.responseSuccess(null, '新增成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '请求失败' + String(err))
  }
}

/**
 *
 * @param {*} req req.body.topic_id student_id group_id conclusion
 * @param {*} next
 */
async function reviseGroupConclusion(req, res, next) {
  try {
    const connection = await getConnection()

    await connection.beginTransaction()

    const { topic_id, student_id, group_id, conclusion } = req.body

    const update_sql = `
  UPDATE node_table t1 
  SET content = '${conclusion}' 
  WHERE
    t1.group_id = ${group_id} 
    AND topic_id = ${topic_id};`

    await connection.execute(update_sql)

    const query_sql = `
  SELECT
    t1.id 
  FROM
    node_table t1 
  WHERE
    t1.group_id = ${group_id} 
    AND topic_id = ${topic_id};
    `

    const [updated_node] = await connection.execute(query_sql)

    const updated_node_id = updated_node[0]?.id

    const insert_revise_sql = `
  INSERT INTO node_revise_record_table ( node_id, revise_content, created_time, student_id )
  VALUES
    (${updated_node_id}, '${conclusion}', now(), ${student_id} )
    `

    await connection.execute(insert_revise_sql)

    await connection.commit()

    res.responseSuccess(null, '更新成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '更新失败')
  }
}

/**
 *
 * @param {*} req req.body.node_id content student_id
 * @param {*} res
 * @param {*} next
 */
async function reviseIdea(req, res, next) {
  try {
    const { node_id, content, student_id } = req.body
    const connection = await getConnection()

    await connection.beginTransaction()

    const update_sql = `
    UPDATE node_table t1 
    SET content = '${content}' 
    WHERE
      t1.id = ${node_id};
    `

    await connection.execute(update_sql)

    const insert_revise_sql = `
    INSERT INTO node_revise_record_table ( node_id, revise_content, created_time, student_id )
    VALUES
      (${node_id}, '${content}', now(), ${student_id} )
      `
    await connection.execute(insert_revise_sql)

    await connection.commit()

    res.responseSuccess(null, '更新成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '更新失败')
  }
}

module.exports = {
  queryFlowData,
  queryContentData,
  proposeIdea,
  replyIdea,
  reviseIdea,
  reviseGroupConclusion,
}
