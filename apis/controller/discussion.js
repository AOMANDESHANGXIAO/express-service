/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:28:00
 * @Description  : 讨论路由的控制器
 */

const { getConnection } = require('../../db/conn')

/**
 *
 * @param {number} req.query.class_id
 * @param {*} res
 * @param {*} next
 */
async function queryAllDiscussion(req, res, next) {
  try {
    const connection = await getConnection()
    const class_id = req.query.class_id
    const sql = `
  SELECT
    t1.id,
    t1.topic_content,
    t1.created_time,
    t2.nickname 
  FROM
    discussion t1
    JOIN admin t2 ON t2.id = t1.created_user_id 
  WHERE
    t1.topic_for_class_id = ${class_id}`

    let [results] = await connection.execute(sql)

    const data = {
      list: results.map(r => {
        return {
          id: r.id,
          topic_content: r.topic_content,
          created_time: r.created_time,
          created_user_name: r.nickname,
        }
      }),
    }

    res.responseSuccess(data, '查询成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '查询失败')
  }
}

module.exports = {
  queryAllDiscussion,
}
