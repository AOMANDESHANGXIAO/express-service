/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 16:08:49
 * @Description  : 管理员登录和注册的控制器
 */

const { getConnection } = require('../../db/conn')

const { hashPassword, comparePassword } = require('../../utils/pwdHandler')

const { generateJwt } = require('../../utils/jwtHandler')

/**
 * @param {object} connection mysql连接
 * @param {string} username
 * @returns admin
 */
async function queryAdmin(connection, username) {
  const sql = `SELECT * FROM admin WHERE username = '${username}'`

  let [results] = await connection.execute(sql)

  return results
}

/**
 *
 * @param {*} req  req.body.username, req.body.password
 * @param {*} res
 * @param {*} next
 */
async function adminSignIn(req, res, next) {
  try {
    const { username, password } = req.body
    const connection = await getConnection()
    const admin = await queryAdmin(connection, username)

    if (admin.length === 0) {
      res.responseFail(null, '用户不存在')
    }

    const isMatch = await comparePassword(password, admin[0].password)

    if (!isMatch) {
      res.responseFail(null, '密码错误')
    }

    const token = generateJwt({ username, admin_id: admin[0].id })

    res.responseSuccess(
      { id: admin[0].id, token, nickname: admin[0].nickname },
      '请求成功'
    )
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 *
 * @param {*} req  req.body.username, req.body.password req.body.nickname
 * @param {*} res
 * @param {*} next
 */
async function adminSignUp(req, res, next) {
  try {
    const { username, password, nickname } = req.body
    const connection = await getConnection()
    const admin = await queryAdmin(connection, username)

    if (admin.length !== 0) {
      return res.responseFail(null, '用户已存在')
    }

    const pwd = await hashPassword(password)

    const sql = `INSERT INTO admin (username, password, nickname) VALUES ('${username}', '${pwd}', '${nickname}')`

    await connection.execute(sql)

    res.responseSuccess(null, '注册成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '注册失败')
  }
}

module.exports = {
  adminSignIn,
  adminSignUp,
}
