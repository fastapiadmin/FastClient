<template>
  <el-config-provider>
    <div class="app-container">
      <el-container>
        <el-aside width="220px" class="sidebar">
          <div class="logo">Electron + FastAPI + Vue3</div>
          <el-menu
            mode="vertical"
            :default-active="activeRoute"
            @select="handleMenuClick"
            class="sidebar-menu"
            background-color="#f5f7fa"
            text-color="#303133"
            active-text-color="#1890ff"
          >
            <el-menu-item index="home">
              <el-icon><House /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="about">
              <el-icon><InfoFilled /></el-icon>
              <span>关于</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <el-container>
          <el-main class="content">
            <router-view />
          </el-main>
          
          <el-footer class="footer">
            Electron + FastAPI + Vue3 示例应用 &copy; {{ new Date().getFullYear() }}
          </el-footer>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { House, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 当前活动路由
const activeRoute = computed(() => {
  return route.name
})

// 处理菜单点击
const handleMenuClick = (key: string) => {
  console.log('菜单点击:', key)
  router.push({ name: key })
}

onMounted(() => {
  console.log('应用已加载')
})
</script>

<style>
/* 全局样式 */
:root {
  --primary-color: #1890ff;
  --primary-light: #e6f7ff;
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;
  --border-color: #e6e6e6;
  --bg-color: #f5f7fa;
  --bg-white: #ffffff;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.05);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--text-primary);
  background-color: var(--bg-white);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.sidebar {
  background-color: #f5f7fa;
  height: 100vh;
  overflow-x: hidden;
  transition: width 0.3s;
  border-right: 1px solid #e6e6e6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
  background-color: #f0f5ff;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-bottom: 1px solid #e6e6e6;
}

.sidebar-menu {
  border-right: none;
  height: calc(100vh - 60px);
}

.sidebar-menu :deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 0;
  border-radius: 4px;
  margin-right: 8px;
  margin-left: 8px;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #e6f7ff;
  color: #1890ff;
  font-weight: 500;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: #f0f5ff;
}

.sidebar-menu :deep(.el-icon) {
  margin-right: 10px;
  font-size: 18px;
}

.content {
  padding: 20px;
  background-color: #ffffff;
  min-height: calc(100vh - 60px);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  margin: 10px;
  overflow-y: auto;
  max-height: calc(100vh - 60px);
}

.footer {
  text-align: center;
  color: #909399;
  background-color: #ffffff;
  height: 40px;
  line-height: 40px;
  padding: 0;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  margin: 0 10px;
}

/* 修复Element Plus菜单样式 */
.el-menu {
  border-bottom: none;
}
</style>