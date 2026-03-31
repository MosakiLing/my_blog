<template>
  <div class="home">
    <h2>最新魔法研究与旅行见闻：</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="article-list">
      <div v-for="article in articles" :key="article.id" class="article-item">
        <router-link :to="`/post/${article.id}`" class="article-title">
          {{ article.title }}
        </router-link>
        <div class="article-meta">
          <span>{{ article.date }}</span>
          <span class="tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">
              {{ tag }}
            </span>
          </span>
        </div>
        <div class="article-excerpt">{{ article.excerpt }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 文章列表数据
const articles = ref([])
const loading = ref(true)

// 获取所有文章
const fetchArticles = async () => {
  try {
    // 文章列表（稍后我们会动态获取，现在先写死）
    articles.value = [
      {
        id: 'first-article',
        title: '我的第一篇文章',
        date: '2026-03-29',
        tags: ['Vue', '前端', '入门'],
        excerpt: '这是我的第一篇技术博客文章，记录学习过程，分享技术心得...'
      },
      {
        id: 'second-article',
        title: 'Vue3 入门(组合式API)',
        date: '2026-03-31',
        tags: ['Vue', '前端', '入门'],
        excerpt: '组合式API（Composition API）是 Vue 3 新增的写法，让代码组织更灵活...'
      }
    ]
    loading.value = false
  } catch (error) {
    console.error('加载文章失败:', error)
    loading.value = false
  }
}

// 页面加载时获取文章
onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.home h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
}

.article-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.article-title {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

.article-title:hover {
  color: #42b983;
  text-decoration: underline;
}

.article-meta {
  display: flex;
  gap: 1rem;
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: #666;
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

.article-excerpt {
  color: #666;
  line-height: 1.5;
  margin-top: 0.5rem;
}
</style>