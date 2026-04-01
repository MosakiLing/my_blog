<template>
  <div class="home">
    <h2>最新魔法研究与旅行见闻：</h2>
    <!-- 情况1：正在加载 -->
    <div v-if="loading" class="loading">加载中...</div>
    <!-- 情况2：加载完成，显示文章列表 -->
    <div v-else class="article-list">
      <!-- 循环显示每一篇文章 -->
      <router-link v-for="article in articles" :key="article.id" class="article-item" :to="`/post/${article.id}`">
        <div class="article-title">{{ article.title }}</div>
        <div class="article-meta">
          <span>{{ article.date }}</span>
          <span class="tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </span>
        </div>
        <div class="article-excerpt">{{ article.excerpt }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 文章列表数据
const articles = ref([])  // 文章列表
const loading = ref(true) // 加载状态，初始为 true（显示"加载中"）

// 解析文章头部信息 frontmatter
const parseFrontmatter = (markdown) => {
  // 用正则找到 --- 和 --- 之间的内容
  // 返回 { data: { title, date, tags }, content: 正文 }
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = markdown.match(frontmatterRegex)
  
  if (!match) {
    return {
      data: { title: '无标题', date: '', tags: [] },
      content: markdown
    }
  }

  const frontmatterStr = match[1]
  const content = match[2]
  const data = {}
  const lines = frontmatterStr.split('\n')
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      let value = line.slice(colonIndex + 1).trim()
      
      if (key === 'tags') {
        value = value.replace(/[\[\]]/g, '')
        data.tags = value.split(',').map(tag => tag.trim())
      } else {
        data[key] = value
      }
    }
  }
  if (!data.tags) data.tags = []
  return { data, content }
}

// 生成摘要（取正文前100个字符，去掉Markdown标记）
const generateExcerpt = (content, maxLength = 100) => {
  // 移除 Markdown 标题标记
  let text = content.replace(/^#+\s+/gm, '')
  // 移除图片标记
  text = text.replace(/!\[.*?\]\(.*?\)/g, '')
  // 移除链接标记，保留文字
  text = text.replace(/\[(.*?)\]\(.*?\)/g, '$1')
  // 移除代码块
  text = text.replace(/```[\s\S]*?```/g, '')
  // 移除行内代码
  text = text.replace(/`(.*?)`/g, '$1')
  // 移除加粗、斜体标记
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')
  
  // 取前 maxLength 个字符
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...'
  }
  return text
}

// 获取所有文章
const fetchArticles = async () => {
  loading.value = true
  try {
    // 第一步：获取文章列表（从 posts.json 读取）
    const listResponse = await fetch('/posts.json')
    if (!listResponse.ok) {
      console.error('无法加载 posts.json，请确保文件存在')
      articles.value = []
      loading.value = false
      return
    }
    
    const fileNames = await listResponse.json()
    
    if (!Array.isArray(fileNames) || fileNames.length === 0) {
      console.warn('posts.json 为空或格式错误')
      articles.value = []
      loading.value = false
      return
    }
    console.log(`找到 ${fileNames.length} 篇文章:`, fileNames)

    // 第二步：循环读取每个 .md 文件
    const articlesData = []
    for (const fileName of fileNames) {
      try {
        const response = await fetch(`/posts/${fileName}.md`)
        if (!response.ok) {
          console.warn(`文章 ${fileName}.md 不存在，跳过`)
          continue
        }
        const text = await response.text()  // 拿到整个 .md 文件内容

        // 解析头部，拿到标题、日期、标签
        const { data, content } = parseFrontmatter(text)
        
        // 生成摘要
        const excerpt = generateExcerpt(content)
        
        // 存储文章数据
        articlesData.push({
          id: fileName,
          title: data.title || '无标题',
          date: data.date || '',
          tags: data.tags || [],
          excerpt: excerpt
        })
      } catch (err) {
        console.error(`加载文章 ${fileName} 失败:`, err)
      }
    }
    
    // 第三步：按日期排序（最新的在前面）
    articlesData.sort((a, b) => {
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date) - new Date(a.date)
    })
    
    // 第四步：把数据放到 articles 里，页面会自动更新
    articles.value = articlesData
    
    if (articlesData.length === 0) {
      console.warn('没有找到任何文章，请在 public/posts 目录下添加 .md 文件')
    }
  } catch (error) {
    console.error('加载文章列表失败:', error)
  } finally {
    loading.value = false // 加载结束
  }
}

// 页面加载时获取文章
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
/* 页面标题 */
.home h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}
/* 加载中文字 */
.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}
/* 文章列表容器（垂直排列，间距24px） */
.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
/* 单个卡片（白色背景、圆角、阴影、内边距） */
.article-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;  /* 阴影变化动画 */
  text-decoration: none;  /* 去掉下划线 */
  display: block;
  color: inherit;  /* 文字颜色继承，不变成蓝色 */
}
/* 鼠标悬停时，阴影变大 */
.article-item:hover {
  box-shadow: 0 6px 16px rgba(0,0,0,0.15);
}
/* 文章标题 */
.article-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;  /* 下边距，和日期分开 */
}
/* 鼠标悬停时，标题颜色变蓝 */
.article-item:hover .article-title{
  color: #42b983;
}
/* 文章日期、标签 */
.article-meta {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
}
/* 文章标签 */
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
/* 文章摘要 */
.article-excerpt {
  color: #666;
  line-height: 1.5;
  margin-top: 0.5rem;
}
</style>