import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  completeTask, 
  uncompleteTask 
} from '../api/api'
import type { Task } from '../api/api'

// 定义接口
export interface ApiResponse {
  message: string
  error?: string
}

// 创建主存储
export const useMainStore = defineStore('main', () => {
  // 状态
  const loading = ref(false)
  const tasks = ref<Task[]>([])
  const error = ref('')
  const currentTask = ref<Task | null>(null)

  // 计算属性
  const completedTasks = computed(() => {
    return tasks.value.filter(task => task.completed)
  })

  const pendingTasks = computed(() => {
    return tasks.value.filter(task => !task.completed)
  })

  const priorityTasks = computed(() => {
    return {
      high: tasks.value.filter(task => task.priority === 3),
      medium: tasks.value.filter(task => task.priority === 2),
      low: tasks.value.filter(task => task.priority === 1)
    }
  })

  // 获取所有任务（带重试机制）
  const fetchTasks = async (retries = 5, delay = 1000) => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await getTasks()
      tasks.value = response
    } catch (err: any) {
      if (retries > 0) {
        // 后端可能还没启动，重试几次
        console.log(`获取任务失败，${retries}秒后重试...`, err.message)
        await new Promise(resolve => setTimeout(resolve, delay))
        return fetchTasks(retries - 1, delay)
      } else {
        error.value = err.message || '获取任务失败，请检查后端服务'
        console.error('获取任务失败:', err)
      }
    } finally {
      loading.value = false
    }
  }

  // 添加任务
  const addTask = async (taskData: Omit<Task, 'id'>) => {
    loading.value = true
    error.value = ''
    
    try {
      const newTask = await createTask(taskData)
      tasks.value.push(newTask)
      return newTask
    } catch (err: any) {
      error.value = err.message || '添加任务失败'
      console.error('添加任务失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新任务
  const editTask = async (taskId: number, taskData: Omit<Task, 'id'>) => {
    loading.value = true
    error.value = ''
    
    try {
      const updatedTask = await updateTask(taskId, taskData)
      const index = tasks.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err: any) {
      error.value = err.message || '更新任务失败'
      console.error('更新任务失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 删除任务
  const removeTask = async (taskId: number) => {
    loading.value = true
    error.value = ''
    
    try {
      await deleteTask(taskId)
      tasks.value = tasks.value.filter(task => task.id !== taskId)
      return true
    } catch (err: any) {
      error.value = err.message || '删除任务失败'
      console.error('删除任务失败:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  // 标记任务为已完成
  const markTaskComplete = async (taskId: number) => {
    loading.value = true
    error.value = ''
    
    try {
      const updatedTask = await completeTask(taskId)
      const index = tasks.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err: any) {
      error.value = err.message || '更新任务状态失败'
      console.error('更新任务状态失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 标记任务为未完成
  const markTaskUncomplete = async (taskId: number) => {
    loading.value = true
    error.value = ''
    
    try {
      const updatedTask = await uncompleteTask(taskId)
      const index = tasks.value.findIndex(task => task.id === taskId)
      if (index !== -1) {
        tasks.value[index] = updatedTask
      }
      return updatedTask
    } catch (err: any) {
      error.value = err.message || '更新任务状态失败'
      console.error('更新任务状态失败:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // 设置当前任务
  const setCurrentTask = (task: Task | null) => {
    currentTask.value = task
  }

  // 重置错误
  const resetError = () => {
    error.value = ''
  }

  return {
    // 状态
    loading,
    tasks,
    error,
    currentTask,
    
    // 计算属性
    completedTasks,
    pendingTasks,
    priorityTasks,
    
    // 方法
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    markTaskComplete,
    markTaskUncomplete,
    setCurrentTask,
    resetError
  }
})