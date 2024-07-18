/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 12:02:45
 * @Description  : the controller of the user
 */

const { getConnection } = require('../../db/conn')

const { hashPassword, comparePassword } = require('../../utils/pwdHandler')
const { generateJwt } = require('../../utils/jwtHandler')
/**
 *
 * @param {string} username
 * @returns
 */
async function isUsernameExist(username) {
  const connection = await getConnection()

  const sql_username_exist = 'SELECT * FROM student WHERE username = ?'

  let [results] = await connection.execute(sql_username_exist, [username])

  return results
}

/**
 *
 * @param {number | null} id
 * @returns
 */
async function queryStudentGroupInfo(id) {
  if (!id) return []
  const connection = await getConnection()

  const sql = `SELECT 
  id, 
  group_color,
  group_name,
  group_code
  FROM \`group\` t1 WHERE t1.id = ${id}
  `

  let [results] = await connection.execute(sql)

  return results
}

/**
 *
 * @param {*} req, req.body.username, req.body.password
 * @param {*} res
 * @param {*} next
 */
async function signin(req, res, next) {
  try {
    const { username, password } = req.body

    let results = await isUsernameExist(username)

    if (results.length === 0) {
      return res.responseFail(null, '用户不存在')
    }

    const db_password = results[0].password

    const isMatch = await comparePassword(password, db_password)

    if (!isMatch) {
      return res.responseFail(null, '密码错误')
    }

    const db_group = await queryStudentGroupInfo(results[0].group_id)

    const data = {
      id: results[0].id,
      username: results[0].username,
      nickname: results[0].nickname,
      class_id: results[0].class_id,
      group_id: results[0].group_id,
      group_name: db_group[0]?.group_name || null,
      group_color: db_group[0]?.group_color || null,
      group_code: db_group[0]?.group_code || null,
      token: generateJwt(username),
    }

    return res.responseSuccess(data, 'Login successful')
  } catch (err) {
    // console.log(err)
    return res.responseFail(null, 'Login failed')
  }
}

/**
 *
 * @param {*} req req.body.username, req.body.password , req.body.nickname, req.body.class_id
 * @param {*} res
 * @param {*} next
 */
async function signup(req, res, next) {
  try {
    const { username, password, nickname, class_id } = req.body

    const db_student = await isUsernameExist(username)

    if (db_student.length > 0) {
      return res.responseFail(null, '用户名已存在')
    }

    const connection = await getConnection()

    await connection.beginTransaction()

    const hashedPassword = await hashPassword(password)

    const sql_insert = `INSERT INTO \`student\` (username, password, nickname, class_id) VALUES ('${username}', '${hashedPassword}', '${nickname}', ${class_id})`

    await connection.execute(sql_insert)

    connection.commit()

    return res.responseSuccess(null, '注册成功')
  } catch {
    // console.log(err)
    connection.rollback()
    return res.responseFail(null, '注册失败')
  }
}

/**
 *
 * @param {*} req req.query.id // 学生的id
 * @param {*} res
 * @param {*} next
 * @description: 查询学生协作数据
 * @returns {discussNum: number,feedbackNum: number,summaryNum: number,proposeNum: number}
 */
async function queryUserCollaborationData(req, res, next) {
  let { id, group_id } = req.query
  id = Number(id)

  let LegendData = []
  let SeriesData = []

  const connection = await getConnection()
  // 查找成员分享观点、不同意观点、同意观点的数量
  const sql = `
    SELECT
      t1.student_id AS id,
      t3.nickname AS NAME,
      sum( CASE WHEN t2.type = 'idea_to_group' THEN 1 ELSE 0 END ) AS proposeNum,
      sum( CASE WHEN t2.type = 'reject' THEN 1 ELSE 0 END ) AS rejectNum,
      sum( CASE WHEN t2.type = 'approve' THEN 1 ELSE 0 END ) AS approveNum 
    FROM
      node_table t1
      JOIN edge_table t2 ON t2.source = t1.id
      JOIN student t3 ON t3.id = t1.student_id 
      AND t3.group_id = ${group_id} 
    GROUP BY
      t1.student_id;`

  const [results] = await connection.execute(sql)
  // 查询成员的总结观点以及修改的自身观点
  const sql_2 = `
    SELECT
      t1.student_id AS id,
      t3.nickname as stuName,
      SUM( CASE WHEN t2.type = 'group' THEN 1 ELSE 0 END ) AS summaryNum,
      Sum( CASE WHEN t2.type = 'idea' THEN 1 ELSE 0 END ) AS reviseNum 
    FROM
      node_revise_record_table t1
      JOIN node_table t2 ON t2.type = 'group' 
      OR t2.type = 'idea'
      JOIN student t3 ON t3.id = t1.student_id 
      AND t3.group_id = ${group_id} 
      AND t2.id = t1.node_id 
    GROUP BY
      t1.student_id
    `
  const [results_2] = await connection.execute(sql_2)
  // 上两个查询，当学生没有参与讨论时，不会出现在结果中
  // 因此进行补充
  const sql_3 = `
    SELECT
      t1.id,
      t1.nickname stuName 
    FROM
      student t1 
    WHERE
      t1.group_id = 4`

  const [results_3] = await connection.execute(sql_3)

  results_3.forEach(r => {
    LegendData.push(r.stuName)
  })

  const student_map = new Map()
  /**
   * 记录小组成员的姓名和id
   */
  results_3.forEach(r => {
    student_map.set(r.stuName, r)
  })

  let maxP = 0 // 分享
  let maxR = 0 // 不同意
  let maxA = 0 // 同意
  let maxS = 0 // 总结
  let maxRe = 0 // 修改

  /**
   * 学生个人的信息
   */
  let proposeNum = 0
  let feedbackNum = 0
  let summaryNum = 0
  /**
   * 查找成员分享观点最多、同意观点最多以及不同意观点最多的成员
   */
  const stuDiscussMap = new Map()
  results.forEach(r => {
    if (Number(r.proposeNum) > maxP) {
      maxP = Number(r.proposeNum)
    }

    if (Number(r.approveNum) > maxA) {
      maxA = Number(r.approveNum)
    }

    if (Number(r.rejectNum) > maxR) {
      maxR = Number(r.rejectNum)
    }

    stuDiscussMap.set(r.id, r)
  })

  const summaryMap = new Map()

  results_2.forEach(r => {
    if (Number(r.summaryNum) > maxS) {
      maxS = Number(r.summaryNum)
    }
    if (Number(r.reviseNum) > maxRe) {
      maxRe = Number(r.reviseNum)
    }

    // 存储每个学生的总结次数
    summaryMap.set(r.id, {
      summaryNum: Number(r.summaryNum),
      reviseNum: Number(r.reviseNum),
    })
  })
  /**
   * 求学生本人的各方面数据
   */
  // console.log(stuDiscussMap.get(id))
  proposeNum = Number(stuDiscussMap.get(id).proposeNum)
  feedbackNum =
    Number(stuDiscussMap.get(id).approveNum) +
    Number(stuDiscussMap.get(id).rejectNum)
  // console.log(summaryMap)
  summaryNum = Number(summaryMap.get(id).summaryNum)

  const Indicator = [
    {
      name: '发布',
      max: maxP,
    },
    {
      name: '支持',
      max: maxA,
    },
    {
      name: '反对',
      max: maxR,
    },
    {
      name: '总结',
      max: maxS,
    },
    {
      name: '修改',
      max: maxRe,
    },
  ]
  // 找出每个学生发布、支持、反对、总结、修改的情况
  const valueSequence = [
    'proposeNum',
    'approveNum',
    'rejectNum',
    'summaryNum',
    'reviseNum',
  ]

  console.log('LegendData ===>', LegendData)

  LegendData.map(legend => {
    console.log(legend)
    let value = [0, 0, 0, 0, 0]
    const stuId = Number(student_map.get(legend).id) // 通过名字找到id
    console.log(summaryMap)
    console.log(stuId, stuDiscussMap.get(stuId), summaryMap.get(stuId))

    stuDiscussMap.get(stuId) &&
      Object.keys(stuDiscussMap.get(stuId)).map(key => {
        if (valueSequence.includes(key)) {
          value[valueSequence.indexOf(key)] = Number(
            stuDiscussMap.get(stuId)[key]
          )
        }
      })

    summaryMap.get(stuId) &&
      Object.keys(summaryMap.get(stuId)).map(key => {
        if (valueSequence.includes(key)) {
          value[valueSequence.indexOf(key)] = Number(summaryMap.get(stuId)[key])
        }
      })

    SeriesData.push({
      name: legend,
      value,
    })
  })

  const data = {
    selfAnalysisList: [
      {
        iconName: 'discussion',
        text: '参与了讨论',
        num: Number(proposeNum) + Number(feedbackNum) + Number(summaryNum),
      },
      {
        iconName: 'share',
        text: '分享了观点',
        num: Number(proposeNum),
      },
      {
        iconName: 'feedback',
        text: '反馈了观点',
        num: Number(feedbackNum),
      },
      {
        iconName: 'summary',
        text: '总结了讨论',
        num: Number(summaryNum),
      },
    ],
    Indicator,
    LegendData,
    SeriesData
  }

  return res.responseSuccess(data, '查询成功')
  // } catch (err) {
  //   return res.responseFail(null, '查询失败' + err.toString())
  // }
}

module.exports = {
  signin,
  signup,
  queryUserCollaborationData,
}
