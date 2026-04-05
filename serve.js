const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json())  // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true }))

// 静态文件服务（让前端能访问 public 文件夹）
app.use(express.static('public'))

// 处理保存文章的请求
app.post('/api/save-post', (req, res) => {
  const { title, tags, content } = req.body

  // 1. 校验
  if (!title || !content) {
    return res.status(400).json({ error: '标题和内容不能为空' })
  }

  // 2. 生成文件名（拼音化处理，简单转英文）
  let fileName = title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]/g, '-')   // 中文保留，其他符号变横杠
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  // 如果处理后为空，则用时间戳
  if (!fileName) fileName = Date.now().toString()

  // 3. 处理标签
  let tagList = []
  if (tags) {
    tagList = tags.split(',').map(t => t.trim()).filter(t => t)
  }

  // 4. 生成 frontmatter
  const date = new Date().toISOString().slice(0, 10)
  const frontmatter = `---
title: ${title}
date: ${date}
tags: ${tagList.join(', ')}
---

${content}`

  // 5. 保存 .md 文件到 public/posts/
  const postsDir = path.join(__dirname, 'public', 'posts')
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true })
  }
  const filePath = path.join(postsDir, `${fileName}.md`)
  fs.writeFileSync(filePath, frontmatter, 'utf8')

  // 6. 更新 posts.json
  const jsonPath = path.join(__dirname, 'public', 'posts.json')
  let postsList = []
  if (fs.existsSync(jsonPath)) {
    const jsonContent = fs.readFileSync(jsonPath, 'utf8')
    postsList = JSON.parse(jsonContent)
  }
  if (!postsList.includes(fileName)) {
    postsList.push(fileName)
    fs.writeFileSync(jsonPath, JSON.stringify(postsList, null, 2), 'utf8')
  }

  res.json({ success: true, fileName, message: '文章保存成功' })
})

// 启动服务器
const PORT = 3000
app.listen(PORT, () => {
  console.log(`后端服务已启动: http://localhost:${PORT}`)
})