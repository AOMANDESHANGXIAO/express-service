/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 17:24:29
 * @Description  : the controller of the group
 */

/**
 * @param {*} req req.body.group_name, req.body.group_color , req.body.group_description, req.body.student_id, req.body.class_id
 * @description: 创建小队
 *
 */

const { getConnection } = require('../../db/conn')

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
    }
    
  } catch (err) {
    console.log(err)
    await connection.rollback()
    return res.responseFail(null, '创建失败')
  }
}

module.exports = {
  createGroup,
}
