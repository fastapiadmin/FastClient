import axios from 'axios'
import type { ApiResponse } from '../store'

// 任务类型定义
export interface Task {
  id?: number
  title: string
  description?: string
  completed: boolean
  priority: number  // 1-低, 2-中, 3-高
}

// 判断是否在Electron环境中
const isElectron = window.navigator.userAgent.toLowerCase().indexOf('electron') > -1

// 创建axios实例
const api = axios.create({
  // 在Electron环境中直接使用FastAPI的URL，否则使用代理
  // 所有环境都使用8001端口
  baseURL: isElectron ? 'http://localhost:8001' : '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    // 处理错误响应
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('API错误:', error.response.data)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误:', error.request)
    } else {
      // 请求设置时发生错误
      console.error('请求错误:', error.message)
    }
    return Promise.reject(error)
  }
)

// API函数

// 获取根路径数据
export const getRoot = async (): Promise<ApiResponse> => {
  return await api.get('/')
}

// 获取任务列表
export const getTasks = async (completed?: boolean, priority?: number): Promise<Task[]> => {
  return await api.get('/tasks', { params: { completed, priority } })
}

// 获取单个任务
export const getTask = async (id: number): Promise<Task> => {
  return await api.get(`/tasks/${id}`)
}

// 创建任务
export const createTask = async (task: Omit<Task, 'id'>): Promise<Task> => {
  return await api.post('/tasks', task)
}

// 更新任务
export const updateTask = async (id: number, task: Omit<Task, 'id'>): Promise<Task> => {
  return await api.put(`/tasks/${id}`, task)
}

// 删除任务
export const deleteTask = async (id: number): Promise<{ message: string }> => {
  return await api.delete(`/tasks/${id}`)
}

// 完成任务
export const completeTask = async (id: number): Promise<Task> => {
  return await api.patch(`/tasks/${id}/complete`)
}

// 取消完成任务
export const uncompleteTask = async (id: number): Promise<Task> => {
  return await api.patch(`/tasks/${id}/uncomplete`)
}

export default api