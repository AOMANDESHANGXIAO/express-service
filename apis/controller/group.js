/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 17:24:29
 * @Description  : the controller of the group
 */

const { getConnection } = require('../../db/conn')
const {
  queryGroupShareFeedbackNumber,
  querySummaryNumber,
  queryGroupStudentProposeFeedbackData,
  queryGroupStudentSummaryData,
} = require('../../crud/group/query')

/**
 * @param {*} req req.body.group_name, req.body.group_color , req.body.group_description, req.body.student_id, req.body.class_id
 * @description: 创建小队
 *
 */
async function createGroup(req, res, next) {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()

    const { group_name, group_color, group_description, student_id, class_id } =
      req.body
    // 查询学生是否已有团队
    const sql_is_grouped = `SELECT * FROM \`student\` WHERE id = ${student_id} `

    let [results_is_grouped] = await connection.execute(sql_is_grouped)

    if (results_is_grouped[0].group_id !== null) {
      return res.responseFail(null, '该学生已有团队')
    }

    // 查询组名是否重复
    const sql_group_name_exist = `SELECT * FROM \`group\` WHERE group_name = '${group_name}'`
    let [results_group_name_exist] = await connection.execute(
      sql_group_name_exist
    )

    if (results_group_name_exist.length > 0) {
      return res.responseFail(null, '组名重复')
    }

    // 创建小队

    const sql_create_group = `INSERT INTO \`group\` (group_name, group_color, group_description, belong_class_id) VALUES ('${group_name}', '${group_color}', '${group_description}', ${class_id})`
    let [results_create_group] = await connection.execute(sql_create_group)

    let data = {}
    if (results_create_group.affectedRows === 1) {
      // 创建成功
      const insert_group_id = results_create_group.insertId
      // 更新学生的团队id以及group的团队码为ckcXXX
      const sql_update_student_group_id = `UPDATE student SET group_id = ${results_create_group.insertId} WHERE id = ${student_id}`
      const sql_update_group_code = `UPDATE \`group\` SET group_code = 'ckc${insert_group_id}' WHERE id = ${insert_group_id}`

      await connection.execute(sql_update_student_group_id)
      await connection.execute(sql_update_group_code)

      const sql_get_group_id = `SELECT * FROM \`group\` WHERE id = ${insert_group_id}`
      let [results_get_group] = await connection.execute(sql_get_group_id)

      data = {
        group_id: results_get_group[0].id,
        group_name: results_get_group[0].group_name,
        group_description: results_get_group[0].group_description,
        group_color: results_get_group[0].group_color,
        group_code: results_get_group[0].group_code,
        belong_class_id: results_get_group[0].belong_class_id,
      }

      await connection.commit()
      return res.responseSuccess(data, '创建成功')
    } else {
      await connection.rollback()
      return res.responseFail(null, '创建失败')
    }
  } catch (err) {
    // console.log(err)
    await connection.rollback()
    return res.responseFail(null, '创建失败')
  }
}

/**
 *
 * @param {*} req req.body.student_id, req.body.group_code
 * @param {*} res
 * @param {*} next
 */
async function joinGroup(req, res, next) {
  const connection = await getConnection()
  try {
    await connection.beginTransaction()

    const sql_query_group = `SELECT * FROM \`group\` WHERE group_code = '${req.body.group_code}'`
    let [results_group] = await connection.execute(sql_query_group)

    if (results_group.length === 0) {
      return res.responseFail(null, '小队不存在')
    }

    const sql_query_student = `SELECT * FROM student WHERE id = ${req.body.student_id}`
    let [results_student] = await connection.execute(sql_query_student)

    if (results_student.length === 0) {
      return res.responseFail(null, '学生不存在')
    } else if (results_student[0].group_id !== null) {
      return res.responseFail(null, '该学生已有团队')
    }

    const sql_update_student = `UPDATE student SET group_id = ${results_group[0].id} WHERE id = ${req.body.student_id}`

    await connection.execute(sql_update_student)

    const data = {
      group_id: results_group[0].id,
      group_name: results_group[0].group_name,
      group_description: results_group[0].group_description,
      group_color: results_group[0].group_color,
      group_code: results_group[0].group_code,
      belong_class_id: results_group[0].belong_class_id,
    }

    await connection.commit()

    return res.responseSuccess(data, '加入成功')
  } catch {
    await connection.rollback()
    return res.responseFail(null, '加入失败')
  }
}

/**
 *
 * @param {number} req.query.group_id
 */
async function queryGroupCollaborationData(req, res, next) {
  try {
    const id = req.query.group_id

    const share_feedback_data = await queryGroupShareFeedbackNumber(id)

    // const discussion_data = await queryDiscussionNumber(id)

    const summary_data = await querySummaryNumber(id)

    // 新算法：将讨论数=分享数+总结数+反馈数目
    const discussion_data = share_feedback_data['share'] + share_feedback_data['feedback'] + summary_data

    const data = {
      list: [
        {
          iconName: 'discussion',
          text: '参与了讨论',
          num: discussion_data,
        },
        {
          iconName: 'share',
          text: '分享过观点',
          num: share_feedback_data['share'],
        },
        {
          iconName: 'feedback',
          text: '反馈过观点',
          num: share_feedback_data['feedback'],
        },
        {
          iconName: 'summary',
          text: '总结过观点',
          num: summary_data,
        },
      ],
    }

    res.responseSuccess(data, '查询成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '查询失败')
  }
}

/**
 *
 * @param {number} req.query.student_id
 */
async function queryStudentGroup(req, res, next) {
  try {
    const student_id = req.query.student_id
    const connection = await getConnection()
    const sql = `
SELECT
	t2.id,
	t2.group_name,
	t2.group_description,
	t2.group_code,
	t2.group_color,
	t2.belong_class_id 
FROM
	student t1
	JOIN \`group\` t2 ON t2.id = t1.group_id 
WHERE
	t1.id = ${student_id};
  `

    let [results] = await connection.execute(sql)

    const data = {
      group_id: results[0].id,
      group_name: results[0].group_name,
      group_description: results[0].group_description,
      group_code: results[0].group_code,
      group_color: results[0].group_color,
      belong_class_id: results[0].belong_class_id,
    }

    res.responseSuccess(data, '查询成功')
  } catch (err) {
    // console.log(err)
    res.responseFail(null, '查询失败')
  }
}

/**
 *
 * @param {number} req.query.group_id
 * @param {*} res
 * @param {*} next
 */
async function queryMemberData(req, res, next) {
  try {
    const group_id = req.query.group_id

    const feedback_propose_list = await queryGroupStudentProposeFeedbackData(
      group_id
    )

    const summary_list = await queryGroupStudentSummaryData(group_id)

    let feedback_list_data = []
    let propose_list_data = []
    let summary_list_data = []

    feedback_propose_list.forEach(item => {
      feedback_list_data.push({
        value: item['feedbackNum'],
        name: item['name'],
      })
      propose_list_data.push({
        value: item['proposeNum'],
        name: item['name'],
      })
    })

    summary_list.forEach(item => {
      summary_list_data.push({
        value: item['summaryNum'],
        name: item['name'],
      })
    })

    const data = {
      feedbackList: feedback_list_data,
      proposeList: propose_list_data,
      summaryList: summary_list_data,
    }

    res.responseSuccess(data, '查询成功')
  } catch (err) {
    res.responseFail(null, '查询失败' + String(err))
  }
}

/**
 *
 * @param {number} req.query.group_id
 * @param {number} req.query.topic_id
 * @param {*} res
 * @param {*} next
 */
async function queryReviseData(req, res, next) {
  const connection = await getConnection()
  try {
    const { group_id, topic_id } = req.query
    const sql = `
SELECT
	t1.revise_content,
	t2.nickname,
	t1.created_time 
FROM
	node_revise_record_table t1
	JOIN student t2 ON t1.student_id = t2.id
	JOIN \`group\` t3 ON t3.id = t2.group_id
	JOIN node_table t4 ON t4.topic_id = ${topic_id} 
	AND t1.node_id = t4.id 
WHERE
	t3.id = ${group_id} 
ORDER BY
	t1.created_time DESC 
	LIMIT 5;
  `

    let [results] = await connection.execute(sql)

    const data = {
      list: results.map(r => {
        return {
          creator: r.nickname,
          content: r.revise_content,
          timestamp: r.created_time,
        }
      }),
    }

    res.responseSuccess(data, '查询成功')
  } catch (err) {
    res.responseFail(null, '查询失败' + String(err))
  }
}

module.exports = {
  createGroup,
  joinGroup,
  queryGroupCollaborationData,
  queryStudentGroup,
  queryMemberData,
  queryReviseData,
}
