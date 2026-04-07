<script setup></script>

<template>
  <div id="app">
    <header>
      <h1>Mosaki_Ling的巫师手札</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/statistics">数据统计</router-link>
        <router-link to="/about">关于我</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>© 2026 我的博客 | 基于Vue3构建</p>
    </footer>
  </div>
</template>

<style>
/* 1. 清除默认边距 全局重置（清除浏览器默认边距）*/
* {
  margin: 0;  /* 去掉所有元素的外边距 */
  padding: 0; /* 去掉所有元素的内边距 */
}

/* 2. 整体布局 整个应用的容器（#app）*/
#app {
  min-height: 100vh;  /* 最小高度占满整个屏幕 */
  display: flex;  /* 开启弹性布局 */
  flex-direction: column; /* 上下排列（header→main→footer） */
}

/* 3. 顶部导航栏 顶部导航栏（header）*/
header {
  background: #2c3e50;   /* 背景色 */
  color: white;  /* 字体颜色 */
  padding: 16px 32px;  /* 内边距 */
  display: flex;  /* 开启弹性布局 */
  justify-content: space-between;  /* 两端对齐 */
  align-items: center;  /* 垂直居中 */
}

/* 4. 导航链接 导航链接（nav a）*/
nav a {
  color: white;  /* 字体颜色 */
  text-decoration: none;  /* 去掉下划线 */
  margin-left: 20px;  /* 左边距 */
}

nav a:hover {
  text-decoration: underline;  /* 下划线 */
}

/* 5. 内容区 主要内容区（main）*/
main {
  max-width: 1200px;  /* 最大宽度 */
  margin: 32px auto;  /* 外边距 */
  padding: 0 16px;  /* 内边距 */
  flex: 1;  /* 弹性布局 */
}

/* 6. 底部 底部（footer）*/
footer {
  background: #f5f5f5;  /* 背景色 */
  text-align: center;  /* 居中 */
  padding: 16px;  /* 内边距 */
  color: #666;  /* 字体颜色 */
}

/* 7. 手机适配 手机端适配 */
@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    text-align: center;
  }
  nav {
    display: flex;
    gap: 1rem;
  }
}
</style>
