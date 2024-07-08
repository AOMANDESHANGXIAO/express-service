/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-08 11:40:49
 * @Description  : the jwt middleware
 */
const expressJWT  = require('express-jwt')

const { secretKey, ignoreRoutes } = require('../../cnf').jwt

const jwtAuth = expressJWT.expressjwt({ secret: secretKey, algorithms: ['HS256'] }).unless({
  path: ignoreRoutes,
})

module.exports = {
  jwtAuth
}