// 解析 markdown 头部
export const parseFrontmatter = (markdown) => {
  const match = markdown.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) {
    return { data: { title: '无标题', date: '', tags: [] }, content: markdown }
  }
  
  const data = {}
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      let val = line.slice(idx + 1).trim()
      if (key === 'tags') {
        data.tags = val.replace(/[\[\]]/g, '').split(',').map(t => t.trim())
      } else {
        data[key] = val
      }
    }
  })
  if (!data.tags) data.tags = []
  return { data, content: match[2] }
}

// 提取纯文本
export const getPlainText = (content, maxLen = 5000) => {
  let text = content
    .replace(/^#+\s+/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`(.*?)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\n/g, ' ')
  return text.length > maxLen ? text.slice(0, maxLen) : text
}
