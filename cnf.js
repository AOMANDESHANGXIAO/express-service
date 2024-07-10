/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-07 20:05:36
 * @Description  : the config of the project
 */

const config = {
  port: 8000 /* the port of the server */,
  db: {
    /* the config of the mysql database */ host: 'localhost',
    port: 3307,
    user: 'root',
    password: '123456',
    database: 'knowledgebuilding',
  },
  jwt: {
    /* the config of the jwt */ secretKey: 'TheRidiculousAdventurer',
    expiresIn: '30d',
    ignoreRoutes: [
      '/user/signin',
      '/user/signup',
      '/classroom/queryClassroomList',
      '/admin/sign/signin',
      '/admin/sign/signup',
    ],
  },
}

module.exports = config
