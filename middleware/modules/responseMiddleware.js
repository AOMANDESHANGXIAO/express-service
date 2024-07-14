/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns
 * @description: success response middleware
 */
function responseSuccess (req, res, next) {
  const that = res
  res.responseSuccess = (data, message) => {
    that.status(200).json({
      code:200,
      success: true,
      message: message || 'Request successful',
      data: data || null, 
    })
  }
 
  next()
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns
 * @description: fail response middleware
 */
function responseFail (req, res, next) {
  const that = res
  res.responseFail = (data, message) => {
    that.status(200).json({
      code: 200,
      success: false,
      message: message || 'Request failed',
      data: data || null, 
    })
  }
  
  next()
}

module.exports = {
  responseSuccess,
  responseFail
}