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
    console.log(err)
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
    console.log(err)
    connection.rollback()
    return res.responseFail(null, '注册失败')
  }
}

module.exports = {
  signin,
  signup,
}
