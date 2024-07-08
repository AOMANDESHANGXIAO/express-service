const express = require('express')

const router = express.Router()

const prefix = '/test'

router.get('/info', (req, res) => {
  res.responseSuccess({ id: 1 }, 'Success')
})

router.get('/list', (req, res) => {
  res.responseSuccess({ list: [1, 2] }, 'Success')
})

router.get('/user/detail', (req, res) => {
  res.responseSuccess({ id: 1 }, 'Success') 
})

module.exports = {
  prefix,
  router
}
