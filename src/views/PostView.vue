<template>
  <div class="post" v-if="article">
    <h1>{{ article.title }}</h1>
    <div class="post-meta">
      <span>{{ article.date }}</span>
      <div class="tags">
        <span v-for="tag in article.tags" :key="tag" class="tag">
          {{ tag }}
        </span>
      </div>
    </div>
    <div class="post-content" v-html="article.content"></div>
  </div>
  <div v-else-if="loading" class="loading">
    <p>加载中...</p>
  </div>
  <div v-else class="error">
    <p>加载失败，请检查文章是否存在</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const route = useRoute()
const article = ref(null)
const loading = ref(true)

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (err) {
        console.error(err)
      }
    }
    return ''
  }
})

// 手动解析 frontmatter（替代 gray-matter）
const parseFrontmatter = (markdown) => {
  // 匹配 --- 开头和结尾的 YAML 格式
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = markdown.match(frontmatterRegex)
  
  if (!match) {
    // 没有 frontmatter，返回默认值
    return {
      data: { title: '无标题', date: '', tags: [] },
      content: markdown
    }
  }
  
  const frontmatterStr = match[1]
  const content = match[2]
  
  // 手动解析 YAML 格式的 frontmatter
  const data = {}
  const lines = frontmatterStr.split('\n')
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      
      // 处理 tags（格式: tags: Vue, 前端, 入门 或 tags: [Vue, 前端]）
      if (key === 'tags') {
        // 去掉方括号
        value = value.replace(/[\[\]]/g, '')
        // 按逗号分割，并去除空格
        data.tags = value.split(',').map(tag => tag.trim())
      } else {
        data[key] = value
      }
    }
  }
  
  // 确保 tags 总是数组
  if (!data.tags) data.tags = []
  
  return { data, content }
}

// 加载文章内容
const loadArticle = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('加载文章:', id)
    
    // 获取 markdown 文件
    const response = await fetch(`/posts/${id}.md`)
    if (!response.ok) {
      throw new Error(`文章不存在: ${id}`)
    }
    const text = await response.text()
    
    // 解析 frontmatter
    const { data, content } = parseFrontmatter(text)
    
    // 渲染 markdown 为 HTML
    const htmlContent = md.render(content)
    
    article.value = {
      id,
      title: data.title || '无标题',
      date: data.date || '',
      tags: data.tags || [],
      content: htmlContent
    }
    
    console.log('文章加载成功:', article.value.title)
  } catch (error) {
    console.error('加载文章失败:', error)
    article.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadArticle()
})
</script>

<style scoped>
.post {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.post h1 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.post-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background: #f0f0f0;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.post-content {
  line-height: 1.8;
  color: #333;
}

.post-content h2 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.post-content p {
  margin-bottom: 1rem;
}

.post-content pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1rem 0;
}

.post-content code {
  background: #f5f5f5;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875em;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.error {
  color: #e74c3c;
}
</style>