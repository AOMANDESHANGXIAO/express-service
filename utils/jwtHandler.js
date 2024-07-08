/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 16:01:08
 * @Description  : generate jwt
 */

const jwt = require('jsonwebtoken')
const { secretKey, expiresIn } = require('../cnf').jwt

/**
 *
 * @param {string} payload
 */
function generateJwt(payload) {
  const token = jwt.sign({ payload }, secretKey, { expiresIn })

  return 'Bearer ' + token
}


module.exports = {
  generateJwt
}
