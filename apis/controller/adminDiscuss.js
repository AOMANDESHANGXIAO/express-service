/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 16:44:14
 * @Description  : 管理员创建讨论用
 */

const { getConnection } = require('../../db/conn')

const { nodeTypeObj, edgeTypeObj } = require('../../CONSTANT')

/**
 *
 * @param {number} class_id
 * @param {Array[{id:number}]} group_ids
 * @param {number} topic_id
 * @returns {string} the sql
 */
function generateGroupNodeInsertSql(class_id, group_ids, topic_id) {
  let baseSql = `
INSERT INTO node_table ( type, content, class_id, group_id, topic_id, created_time )
VALUES
    `

  group_ids.forEach((item, index) => {
    baseSql += `('${nodeTypeObj.group}', '${''}', ${class_id}, ${
      item.id
    }, ${topic_id}, NOW())`
    if (index !== group_ids.length - 1) {
      baseSql += ','
    }
  })

  baseSql += ';'

  return baseSql
}

/**
 *
 * @param {Array[{id:number}]} sources
 * @param {number} target
 * @param {number} topic_id
 * @return {string} the sql
 */
function generateEdgeInsertSql(sources, target, topic_id) {
  let baseSql = `
INSERT INTO edge_table ( type, source, target, topic_id )
VALUES
    `

  sources.forEach((item, index) => {
    baseSql += `('${edgeTypeObj.group_to_discuss}', ${item.id}, ${target}, ${topic_id})`
    if (index !== sources.length - 1) {
      baseSql += ','
    }
  })

  baseSql += `;`

  return baseSql
}
/**
 *
 * @param {*} req req.body.topic_content, class_id, created_user_id
 * @param {*} res
 * @param {*} next
 */
async function createDiscussion(req, res, next) {
  try {
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

    // console.log('new_discuss_id >>>', new_discuss_id)

    // 创建节点，讨论节点，小组节点
    const insert_topic_node_sql = `
  INSERT INTO node_table (content, type, class_id, topic_id, created_time)
  VALUES ('${topic_content}', 'topic', ${class_id}, ${new_discuss_id}, NOW())
  `

    const new_topic_node = await connection.execute(insert_topic_node_sql)

    const new_topic_node_id = new_topic_node[0].insertId

    const query_group_ids_sql = `SELECT
	id 
FROM
	\`group\` t1 
WHERE
	t1.belong_class_id = ${class_id};`

    const [group_ids] = await connection.execute(query_group_ids_sql)

    // 如果没有小组
    if (group_ids.length === 0) {
      await connection.rollback()
      return res.responseFail(null, '创建失败，当前班级没有小组')
    }

    // console.log('group_ids >>>', group_ids)

    // 根据小组id创建小组的节点
    // 批量插入节点
    const sql = generateGroupNodeInsertSql(class_id, group_ids, new_discuss_id)

    // console.log('sql >>>', sql)

    await connection.execute(sql)

    // 获取批量插入的ids
    const query_insert_group_ids_sql = `SELECT
	id 
FROM
	node_table t1 
WHERE
	t1.class_id = ${class_id} 
	AND t1.topic_id = ${new_discuss_id};`

    const [insert_group_ids] = await connection.execute(
      query_insert_group_ids_sql
    )

    // 创建边 即 小组节点和讨论节点之间的边
    const insert_edges_sql = generateEdgeInsertSql(
      insert_group_ids,
      new_topic_node_id,
      new_discuss_id
    )

    await connection.execute(insert_edges_sql)

    await connection.commit()

    res.responseSuccess(null, '创建成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '创建失败')
  }
}

module.exports = {
  createDiscussion,
}
