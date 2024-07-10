/**
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-10 10:22:18
 * @Description  : 存储常量
*/

const nodeTypeObj = {
  topic: 'topic',
  idea: 'idea',
  group: 'group',
}

const edgeTypeObj = {
  approve: 'approve',
  reject: 'reject',
  group_to_discuss: 'group_to_discuss',
  idea_to_group: 'idea_to_group',
}

module.exports = {
  nodeTypeObj,
  edgeTypeObj,
}
