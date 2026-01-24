const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 获取应用信息
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // 与主进程通信的方法
  send: (channel, data) => {
    // 白名单通道
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // 接收来自主进程的消息
  receive: (channel, func) => {
    // 白名单通道
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      // 删除旧的监听器以避免重复
      ipcRenderer.removeAllListeners(channel);
      // 添加新的监听器
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  }
})

// 在预加载脚本中添加一些全局变量
contextBridge.exposeInMainWorld('appRuntime', {
  isElectron: true,
  platform: process.platform
})

// 在预加载脚本中添加一些信息到window对象
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  // 显示Electron和Chrome版本信息（可选）
  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency] || '')
  }
})