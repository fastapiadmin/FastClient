<template>
  <div class="home-container">
    <el-card class="card" header="任务管理系统 - 测试自动刷新">
      <div class="card-content">
        <el-alert v-if="mainStore.error" type="error" :title="mainStore.error" show-icon @close="mainStore.resetError" />
        
        <!-- 任务统计 -->
        <div class="stats-section">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-statistic title="总任务数" :value="mainStore.tasks.length" :value-style="{ color: '#3f8600' }" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="完成任务" :value="mainStore.completedTasks.length" :value-style="{ color: '#13c2c2' }" />
            </el-col>
            <el-col :span="8">
              <el-statistic title="待办任务" :value="mainStore.pendingTasks.length" :value-style="{ color: '#1890ff' }" />
            </el-col>
          </el-row>
        </div>
        
        <el-divider />
        
        <!-- 添加任务表单 -->
        <el-card class="sub-card" header="添加任务">
          <el-form :model="taskForm" :rules="rules" ref="taskFormRef" label-width="80px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="任务标题" prop="title">
                  <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="taskForm.priority" placeholder="请选择优先级">
                    <el-option label="低" :value="1" />
                    <el-option label="中" :value="2" />
                    <el-option label="高" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="描述">
                  <el-input v-model="taskForm.description" type="textarea" :rows="2" placeholder="请输入任务描述" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24" style="text-align: right;">
                <el-button @click="resetForm">取消</el-button>
                <el-button type="primary" @click="addTask" :loading="mainStore.loading">保存</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        
        <!-- 任务列表 -->
        <el-card class="sub-card" header="任务列表">
          <div class="filter-section">
            <el-button-group>
              <el-button :type="activeFilter === 'all' ? 'primary' : 'default'" @click="activeFilter = 'all'">全部</el-button>
              <el-button :type="activeFilter === 'pending' ? 'primary' : 'default'" @click="activeFilter = 'pending'">待办</el-button>
              <el-button :type="activeFilter === 'completed' ? 'primary' : 'default'" @click="activeFilter = 'completed'">已完成</el-button>
            </el-button-group>
          </div>
          
          <el-table
            v-loading="mainStore.loading"
            :data="filteredTasks"
            style="width: 100%"
            row-key="id"
            @row-click="handleRowClick"
          >
            <el-table-column prop="id" label="ID" width="80" align="center" />
            <el-table-column prop="title" label="任务标题" min-width="200" />
            <el-table-column prop="description" label="描述" min-width="300" />
            <el-table-column prop="priority" label="优先级" width="100" align="center">
              <template #default="scope">
                <el-tag :type="scope.row.priority === 3 ? 'danger' : scope.row.priority === 2 ? 'warning' : 'success'">
                  {{ scope.row.priority === 3 ? '高' : scope.row.priority === 2 ? '中' : '低' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="completed" label="状态" width="120" align="center">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.completed"
                  @change="handleStatusChange(scope.row)"
                  active-color="#13ce66"
                  inactive-color="#ff4d4f"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="editTask(scope.row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="deleteTask(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
        
        <!-- 编辑任务对话框 -->
        <el-dialog v-model="dialogVisible" title="编辑任务" width="600px">
          <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="80px">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="任务标题" prop="title">
                  <el-input v-model="editForm.title" placeholder="请输入任务标题" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="优先级" prop="priority">
                  <el-select v-model="editForm.priority" placeholder="请选择优先级">
                    <el-option label="低" :value="1" />
                    <el-option label="中" :value="2" />
                    <el-option label="高" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="描述">
                  <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item label="状态" prop="completed">
                  <el-switch v-model="editForm.completed" active-color="#13ce66" inactive-color="#ff4d4f" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <template #footer>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveEdit" :loading="mainStore.loading">保存</el-button>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance } from 'element-plus'
import { useMainStore } from '../store'
import type { Task } from '../api/api'

// 使用Pinia存储
const mainStore = useMainStore()

// 表单引用
const taskFormRef = ref<FormInstance>()
const editFormRef = ref<FormInstance>()

// 对话框可见性
const dialogVisible = ref(false)

// 筛选条件
const activeFilter = ref('all')

// 任务表单
const taskForm = ref({
  title: '',
  description: '',
  priority: 1,
  completed: false
})

// 编辑表单
const editForm = ref({
  id: undefined,
  title: '',
  description: '',
  priority: 1,
  completed: false
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 筛选后的任务列表
const filteredTasks = computed(() => {
  if (activeFilter.value === 'completed') {
    return mainStore.completedTasks
  } else if (activeFilter.value === 'pending') {
    return mainStore.pendingTasks
  } else {
    return mainStore.tasks
  }
})

// 初始化获取任务列表
onMounted(() => {
  mainStore.fetchTasks()
})

// 重置表单
const resetForm = () => {
  taskFormRef.value?.resetFields()
  taskForm.value = {
    title: '',
    description: '',
    priority: 1,
    completed: false
  }
}

// 添加任务
const addTask = async () => {
  if (!taskFormRef.value) return
  
  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await mainStore.addTask(taskForm.value)
      if (result) {
        ElMessage.success('任务添加成功')
        resetForm()
      }
    }
  })
}

// 处理行点击
const handleRowClick = (row: Task) => {
  console.log('行点击:', row)
}

// 处理状态变更
const handleStatusChange = (row: Task) => {
  if (row.id) {
    if (row.completed) {
      mainStore.markTaskComplete(row.id)
    } else {
      mainStore.markTaskUncomplete(row.id)
    }
  }
}

// 编辑任务
const editTask = (row: Task) => {
  editForm.value = { ...row }
  dialogVisible.value = true
}

// 保存编辑
const saveEdit = async () => {
  if (!editFormRef.value || !editForm.value.id) return
  
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      const result = await mainStore.editTask(editForm.value.id, {
        title: editForm.value.title,
        description: editForm.value.description,
        priority: editForm.value.priority,
        completed: editForm.value.completed
      })
      if (result) {
        ElMessage.success('任务更新成功')
        dialogVisible.value = false
      }
    }
  })
}

// 删除任务
const deleteTask = (row: Task) => {
  if (!row.id) return
  
  ElMessageBox.confirm('确定要删除这个任务吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const result = await mainStore.removeTask(row.id!)
    if (result) {
      ElMessage.success('任务删除成功')
    }
  }).catch(() => {
    // 取消删除
  })
}
</script>

<style scoped>
.home-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
  height: 100%;
}

.card {
  width: 100%;
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.card :deep(.el-card__header) {
  background-color: #f0f5ff;
  color: #1890ff;
  font-weight: bold;
  border-bottom: 1px solid #e6f7ff;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0;
}

.stats-section {
  margin: 20px 0;
  padding: 10px;
  background-color: #fafafa;
  border-radius: 8px;
}

.sub-card {
  margin-bottom: 20px;
}

.filter-section {
  margin-bottom: 15px;
  text-align: right;
}

:deep(.el-card__body) {
  padding-bottom: 0;
}
</style>