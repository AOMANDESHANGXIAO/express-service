/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 10:41:41
 * @Description  : mysql connection
 */
const config = require('../cnf').db

const mysql = require('mysql2/promise')

let conn
/**
 * 
 * @returns conncetion object
 * @description: get connection to mysql
 */
async function getConnection() {
  try {
    if (!conn) {
      console.log('database connecting...')
      conn = await mysql.createConnection(config)
      console.log('database connected!')
    }
    return conn
  } catch (err) {
    console.error('Something went wrong when connecting to database', err)
  }
}

module.exports = {
  getConnection,
}
