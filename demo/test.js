/**
 * 生成argunode插入语句
 */
const generateArgunodeInsertSql = (nodes, arguKey, version) => {
  let sql = `INSERT INTO argunode (type, content, arguKey, version, arguId) VALUES`

  nodes.forEach((node, index) => {
    sql += `('${node.data._type}', '${node.data.inputValue}', ${arguKey}, ${version}, '${node.id}');`
    if (index < nodes.length - 1) {
      sql += ','
    }
  })

  return sql
}

const generateArguedgeInsertSql = (edges, arguKey, version) => {
  let sql = `INSERT INTO arguedge (type, source, target, arguKey, version, arguId) VALUES`

  edges.forEach((edge, index) => {
    sql += `('${edge._type}', '${edge.source}', '${edge.target}', '${arguKey}', ${version}, '${edge.id}');`
    if (index < edges.length - 1) {
      sql += ','
    }
  })

  return sql
}

const nodes = [
  {
    id: 'data',
    data: {
      inputValue: '12312312',
      _type: 'data',
    },
    type: 'element',
  },
  {
    id: 'claim',
    data: {
      inputValue: '123',
      _type: 'claim',
    },
    type: 'element',
  },
]
const edges =  [
  {
      "id": "init-data-claim",
      "source": "data",
      "target": "claim",
      "_type": "data_claim"
  }
]

console.log(generateArguedgeInsertSql(edges, 123, 1))
// console.log(generateArgunodeInsertSql(nodes, 123, 1))
