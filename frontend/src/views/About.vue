<template>
  <div class="about-container">
    <el-card class="card">
      <template #header>
        <div class="card-title">
          <el-avatar :size="64" class="avatar">
            <el-icon><CodeIcon /></el-icon>
          </el-avatar>
          <h2>关于本应用</h2>
        </div>
      </template>
      
      <div class="card-content">
        <div class="section">
          <h3>技术栈</h3>
          <p>本应用使用以下技术栈构建：</p>
          
          <el-descriptions :column="1" border>
            <el-descriptions-item v-for="item in techStack" :key="item.label" :label="item.label">
              {{ item.value }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
        
        <div class="section">
          <h3>架构说明</h3>
          <p>本应用采用前后端分离的架构，通过 Electron 将 FastAPI 后端与 Vue3 前端整合为一个桌面应用。</p>
          
          <el-steps direction="vertical" :space="20">
            <el-step title="前端 (Vue3)" description="负责用户界面和交互逻辑" />
            <el-step title="API通信" description="通过HTTP请求与后端通信" />
            <el-step title="后端 (FastAPI)" description="提供API服务和业务逻辑" />
            <el-step title="Electron" description="将前后端整合为桌面应用" />
          </el-steps>
        </div>
        
        <el-divider />
        
        <div class="footer-info">
          <p>版本: 1.0.0</p>
          <p>© {{ new Date().getFullYear() }} Electron + FastAPI + Vue3 示例应用</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { MoreFilled as CodeIcon } from '@element-plus/icons-vue'

// 技术栈信息
const techStack = [
  {
    label: '前端框架',
    value: 'Vue 3 + TypeScript'
  },
  {
    label: '状态管理',
    value: 'Pinia'
  },
  {
    label: '路由',
    value: 'Vue Router 4'
  },
  {
    label: 'UI组件库',
    value: 'Element Plus'
  },
  {
    label: '构建工具',
    value: 'Vite'
  },
  {
    label: '后端框架',
    value: 'FastAPI (Python)'
  },
  {
    label: '桌面应用框架',
    value: 'Electron'
  }
]
</script>

<style scoped>
.about-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  height: 100%;
}

.card {
  width: 100%;
  max-width: 800px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  background-color: #1890ff;
  color: #fff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 10px 0;
}

.section {
  margin-bottom: 20px;
  background-color: #fafafa;
  padding: 15px;
  border-radius: 4px;
}

.section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  border-left: 4px solid #1890ff;
  padding-left: 10px;
}

.section p {
  margin-bottom: 15px;
  color: #606266;
  line-height: 1.6;
}

.footer-info {
  text-align: center;
  color: #909399;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-descriptions) {
  margin-top: 15px;
}

:deep(.el-descriptions__label) {
  background-color: #f0f5ff;
}

:deep(.el-steps) {
  margin-top: 20px;
}
</style>