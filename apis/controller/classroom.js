/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:41:02
 * @Description  : classroom路由控制器
*/

const { getConnection } = require('../../db/conn')

async function queryClassList(req, res, next) {
  try {
    const connection = await getConnection()
    const sql = `
  SELECT
    t1.id,
    t1.class_name 
  FROM
    class t1 
  WHERE
    t1.\`status\` = 1;
    `
  
    let [results] = await connection.execute(sql)
  
    const data = {
      list: results.map(r=>{
        return {
          id: r.id,
          class_name: r.class_name
        }
      })
    }
  
    res.responseSuccess(data, '请求成功')
  }catch(err) {
    // console.log(err)
    res.responseFail(null, '请求失败')
  }
}

module.exports = {
  queryClassList
}
