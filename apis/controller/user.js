/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 12:02:45
 * @Description  : the controller of the user
 */

const { getConnection } = require('../../db/conn')

/**
 *
 * @param {*} req, req.body.username, req.body.password
 * @param {*} res
 * @param {*} next
 */
async function signin(req, res, next) {
  const { username, password } = req.body

  const sql_username_exist = 'SELECT * FROM student WHERE username = ?'

  const connection = await getConnection()

  let [results] = await connection.execute(sql_username_exist, [username])

  if (results.length === 0) {
    return res.responseFail(null, 'The username does not exist')
  }

  return res.responseSuccess({ id: 1 }, 'Login successful')
}

module.exports = {
  signin,
}
