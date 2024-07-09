/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-09 10:53:33
 * @Description  : flow路由的控制器
 */

const { getConnection } = require('../../db/conn')

const {
  queryIdeaNodes,
  queryTopicNode,
  queryGroupNode,
  queryEdgeNode
} = require('../../crud/flow/query')

const nodeTypeObj = {
  topic: 'topic',
  idea: 'idea',
  group: 'group',
}

/**
 *
 * @param {number} req.query.topic_id
 * @param {*} res
 * @param {*} next
 */
async function queryFlowData(req, res, next) {
  try {
    const { topic_id } = req.query

    const idea_nodes = await queryIdeaNodes(topic_id)

    let res_node = idea_nodes.map(idea => {
      return {
        id: String(idea.node_id),
        type: nodeTypeObj.idea,
        data: {
          name: idea.username,
          id: idea.node_id,
          bgc: idea.group_color,
          student_id: idea.student_id,
        },
        position: {
          x: 0,
          y: 0,
        },
      }
    })

    const topic_node = await queryTopicNode(topic_id, nodeTypeObj)

    let group_nodes = await queryGroupNode(topic_id, nodeTypeObj)
    
    group_nodes = group_nodes.map(group => {
      return {
        id: String(group.node_id),
        type: nodeTypeObj.group,
        data: {
          groupName: group.group_name,
          groupConclusion: group.content,
          bgc: group.group_color,
          group_id: group.group_id,
        },
        position: {
          x: 0,
          y: 0,
        },
      }
    })
    
    res_node = res_node.concat(group_nodes)

    let res_edge = await queryEdgeNode(topic_id)

    res_edge = res_edge.map(edge => {
      return {
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        _type: edge.type,
        animated: true,
      }
    })
    
    const data = {
      nodes: [...res_node, topic_node],
      edges: res_edge,
    }

    res.responseSuccess(data, '请求成功')
  } catch (err) {
    console.log(err)
    res.responseFail(null, '请求失败')
  }
}

/**
 * 
 * @param {number} req.query.node_id 
 * @param {*} res 
 * @param {*} next 
 */
async function queryContentData(req, res, next) {
  
}

module.exports = {
  queryFlowData,
  queryContentData,
}
