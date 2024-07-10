/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 19:18:30
 * @Description  : 复杂的sql 查询
 */

const { getConnection } = require('../../db/conn')

/**
 *
 * @param {number} group_id
 */
async function queryGroupShareFeedbackNumber(group_id) {
  const connection = await getConnection()

  const sql = `
SELECT
	SUM( CASE WHEN edge_table.type = 'idea_to_group' THEN 1 ELSE 0 END ) AS share,
	SUM( CASE WHEN edge_table.type IN ( 'reject', 'approve' ) THEN 1 ELSE 0 END ) AS feedback 
FROM
	edge_table
	JOIN node_table ON node_table.id = edge_table.source
	JOIN student ON student.id = node_table.student_id
	JOIN \`group\` t1 ON t1.id = student.group_id 
WHERE
	t1.id = ${group_id};`

  let [results] = await connection.execute(sql)

  const data = {
    share: Number(results[0].share),
    feedback: Number(results[0].feedback),
  }

  return data
}

/**
 *
 * @param {number} group_id
 */
async function queryDiscussionNumber(group_id) {
  const connection = await getConnection()
  const sql = `
SELECT
	count( * ) cnt
FROM
	discussion t1 
WHERE
	t1.topic_for_class_id = ${group_id};
  `

  let [results] = await connection.execute(sql)

  return results[0].cnt
}

/**
 *
 * @param {number} group_id
 */
async function querySummaryNumber(group_id) {
  const connection = await getConnection()
  const sql = `
SELECT
	count( t1.id ) cnt 
FROM
	node_revise_record_table t1
	JOIN student t2 ON t2.id = t1.student_id 
WHERE
	t2.group_id = ${group_id};
`

  let [results] = await connection.execute(sql)

  return results[0].cnt
}

/**
 *
 * @param {number} group_id
 */
async function queryGroupStudentProposeFeedbackData(group_id) {
  const connection = await getConnection()
  const sql = `
SELECT 
    student.nickname AS name,
    SUM(CASE WHEN edge_table.type = 'idea_to_group' THEN 1 ELSE 0 END) AS proposeNum,
    SUM(CASE WHEN edge_table.type IN ('reject', 'approve') THEN 1 ELSE 0 END) AS feedbackNum
FROM 
    edge_table
JOIN 
    node_table ON node_table.id = edge_table.source
JOIN 
    student ON student.id = node_table.student_id
JOIN 
    \`group\` ON \`group\`.id = student.group_id
WHERE 
    \`group\`.id = ${group_id}
GROUP BY 
    student.id;
  `

  let [results] = await connection.execute(sql)

  let res = results.map(r => {
    return {
      name: r.name,
      proposeNum: Number(r.proposeNum),
      feedbackNum: Number(r.feedbackNum),
    }
  })

  return res
}

/**
 * 
 * @param {number} group_id
 * @description: 查询小组学生总结数据 
 */
async function queryGroupStudentSummaryData(group_id) {
  const connection = await getConnection()
  const sql = `
SELECT
	t2.nickname AS \`name\`, count( t1.id ) AS summaryNum 
FROM
	node_revise_record_table t1
	JOIN student t2 ON t1.student_id = t2.id
	JOIN \`group\` t3 ON t3.id = t2.id 
WHERE
	t3.id = ${group_id} 
GROUP BY
	t2.id;
  `

  let [results] = await connection.execute(sql)

  return results.map(r => {
    return {
      name: r.name,
      summaryNum: Number(r.summaryNum),
    }
  })
}

module.exports = {
  queryGroupShareFeedbackNumber,
  queryDiscussionNumber,
  querySummaryNumber,
  queryGroupStudentProposeFeedbackData,
  queryGroupStudentSummaryData
}
