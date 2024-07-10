/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-10 11:05:31
 * @Description  : 管理班级路由控制器
 */
const { getConnection } = require('../../db/conn')

/**
 *
 * @param {*} req req.body.class_name :string
 * @param {*} res
 * @param {*} next
 */
async function createClass(req, res, next) {
  const connection = await getConnection()
  try {
    const { class_name } = req.body
    await connection.beginTransaction()

    const query_class_name = `SELECT * FROM class WHERE class_name = '${class_name}'`

    const result = await connection.execute(query_class_name)

    if (result[0].length > 0) {
      return res.responseFail(null, '班级已存在')
    }

    const insert_class_sql = `INSERT INTO class (class_name, status) VALUES ('${class_name}', 1)`

    await connection.execute(insert_class_sql)

    await connection.commit()

    res.responseSuccess(null, '创建班级成功')
  } catch (err) {
    console.log(err)
    await connection.rollback()
    res.responseFail(null, '创建班级失败')
  }
}

/**
 * 
 * @param {*} req req.body.class_id :number
 * @param {*} res 
 * @param {*} next 
 */
async function dropClass(req, res, next) {
  const connection = await getConnection()
  try {
    const { class_id } = req.body
    await connection.beginTransaction()

    const query_class_name = `SELECT * FROM class WHERE id = ${class_id}`

    const result = await connection.execute(query_class_name)

    if (result[0].length === 0) {
      return res.responseFail(null, '班级不存在')
    }

    const delete_class_sql = `UPDATE class SET status = 0 WHERE id = ${class_id}`

    await connection.execute(delete_class_sql)

    await connection.commit()

    res.responseSuccess(null, '删除班级成功')
  } catch (err) {
    console.log(err)
    await connection.rollback()
    res.responseFail(null, '删除班级失败')
  }
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async function queryClassList(req, res, next) {
  const connection = await getConnection()
  try {
    const query_class_list_sql = `SELECT id, class_name FROM class WHERE status = 1`

    const result = await connection.execute(query_class_list_sql)

    const data = {
      list: result[0].map((item) => {
        return {
          class_id: item.id,
          class_name: item.class_name,
        }
      })
    }

    res.responseSuccess(data, '查询班级列表成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '查询班级列表失败')
  }
}

module.exports = {
  createClass,
  dropClass,
  queryClassList,
}
