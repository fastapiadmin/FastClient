const { app, BrowserWindow, ipcMain } = require('electron')
const { join } = require('path')
const { spawn } = require('child_process')
const { platform } = require('os')

// 检查是否是开发环境
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 设置环境变量
process.env.NODE_ENV = isDev ? 'development' : 'production'

// FastAPI进程
let fastApiProcess = null

// 主窗口
let mainWindow = null

// 创建主窗口
function createWindow() {
  console.log('Creating main window...')
  
  // 确定预加载脚本路径
  const preloadPath = isDev ? join(__dirname, 'preload.js') : join(__dirname, '..', 'dist', 'electron', 'preload.js')
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  
  // 保留菜单栏，以便显示刷新和开发者工具选项
  
  // 加载应用
  if (isDev) {
    // 开发环境下，加载Vite开发服务器
    mainWindow.loadURL('http://localhost:5174')
    // 打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    // 生产环境下，加载打包后的index.html
    const indexPath = join(__dirname, '..', 'dist', 'index.html')
    mainWindow.loadFile(indexPath)
  }

  // 窗口关闭时释放引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 启动FastAPI后端
function startFastApi() {
  console.log('Starting FastAPI backend...')
  
  if (isDev) {
    // 开发模式：使用 Python 脚本启动
    const backendDir = join(__dirname, '..', '..', 'backend')
    
    try {
      // 优先使用虚拟环境中的 Python
      let pythonPath
      if (platform() === 'win32') {
        pythonPath = join(backendDir, '.venv', 'Scripts', 'python.exe')
      } else {
        pythonPath = join(backendDir, '.venv', 'bin', 'python3')
      }
      fastApiProcess = spawn(pythonPath, ['app/main.py'], {
        cwd: backendDir,
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (error) {
      console.error('Failed to start FastAPI with virtual env Python:', error)
      // 尝试使用系统 Python
      try {
        const pythonExecutable = platform() === 'win32' ? 'python' : 'python3'
        fastApiProcess = spawn(pythonExecutable, ['app/main.py'], {
          cwd: backendDir,
          stdio: ['ignore', 'pipe', 'pipe']
        })
      } catch (error) {
        console.error('Failed to start FastAPI with system Python:', error)
      }
    }
  } else {
    // 生产模式：使用打包的可执行文件
    let backendExecutableName = 'fastapi-backend'
    if (platform() === 'win32') {
      backendExecutableName += '.exe'
    }
    const backendExecutable = join(process.resourcesPath, backendExecutableName)
    
    try {
      fastApiProcess = spawn(backendExecutable, [], {
        stdio: ['ignore', 'pipe', 'pipe']
      })
    } catch (error) {
      console.error('Failed to start FastAPI in production mode:', error)
    }
  }

  // 处理FastAPI进程的输出
  if (fastApiProcess) {
    fastApiProcess.stdout?.on('data', (data) => {
      console.log(`FastAPI: ${data}`)
    })

    fastApiProcess.stderr?.on('data', (data) => {
      console.error(`FastAPI error: ${data}`)
    })

    fastApiProcess.on('close', (code) => {
      console.log(`FastAPI process exited with code ${code}`)
      fastApiProcess = null
    })
  }
}

// 停止FastAPI后端
function stopFastApi() {
  if (fastApiProcess) {
    console.log('Stopping FastAPI process...')
    
    try {
      if (platform() === 'win32' && fastApiProcess.pid) {
        // Windows上使用taskkill强制终止进程
        spawn('taskkill', ['/pid', fastApiProcess.pid.toString(), '/f', '/t'])
      } else {
        // 其他平台使用kill信号
        fastApiProcess.kill('SIGTERM')
      }
    } catch (error) {
      console.error(`Error stopping FastAPI: ${error}`)
    } finally {
      fastApiProcess = null
    }
  }
}

// 创建菜单
const { Menu, MenuItem, clipboard } = require('electron')

// 创建顶部菜单
function createMenu() {
  console.log('Creating menu...')
  
  const template = [
    {
      label: '应用',
      submenu: [
        {
          label: '新建窗口',
          accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
          click() {
            console.log('新建窗口')
            createWindow()
          }
        },
        {
          type: 'separator'
        },
        {
          label: '刷新',
          accelerator: 'CmdOrCtrl+R',
          click(item, focusedWindow) {
            console.log('刷新')
            if (focusedWindow) {
              focusedWindow.reload()
            }
          }
        },
        {
          label: '全屏',
          accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11',
          click(item, focusedWindow) {
            console.log('全屏切换')
            if (focusedWindow) {
              focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: '退出',
          accelerator: 'CmdOrCtrl+Q',
          click() {
            console.log('退出应用')
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        {
          label: '撤销',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo'
        },
        {
          label: '重做',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo'
        },
        {
          type: 'separator'
        },
        {
          label: '剪切',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut'
        },
        {
          label: '复制',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy'
        },
        {
          label: '粘贴',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste'
        },
        {
          type: 'separator'
        },
        {
          label: '全选',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll'
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '开发者工具',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click(item, focusedWindow) {
            console.log('打开开发者工具')
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools()
            }
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click() {
            console.log('关于应用')
            if (mainWindow) {
              mainWindow.webContents.send('show-about')
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Electron官网',
          click() {
            console.log('打开Electron官网')
            const { shell } = require('electron')
            shell.openExternal('https://electronjs.org')
          }
        }
      ]
    }
  ]

  try {
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    console.log('顶部菜单创建成功')
  } catch (error) {
    console.error('创建菜单失败:', error)
  }
}

// 创建右键菜单
function createContextMenu() {
  const contextMenu = new Menu()
  
  // 编辑相关菜单项
  contextMenu.append(new MenuItem({
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }))
  
  contextMenu.append(new MenuItem({
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }))
  
  contextMenu.append(new MenuItem({
    type: 'separator'
  }))
  
  contextMenu.append(new MenuItem({
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }))
  
  contextMenu.append(new MenuItem({
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }))
  
  contextMenu.append(new MenuItem({
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }))
  
  contextMenu.append(new MenuItem({
    type: 'separator'
  }))
  
  contextMenu.append(new MenuItem({
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectAll'
  }))
  
  contextMenu.append(new MenuItem({
    type: 'separator'
  }))
  
  // 页面相关菜单项
  contextMenu.append(new MenuItem({
    label: '刷新',
    accelerator: 'CmdOrCtrl+R',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.reload()
      }
    }
  }))
  
  contextMenu.append(new MenuItem({
    label: '检查元素',
    accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
    click(item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.webContents.toggleDevTools()
      }
    }
  }))
  
  // 监听右键菜单事件
  app.on('browser-window-created', (event, win) => {
    win.webContents.on('context-menu', (e, params) => {
      contextMenu.popup(win, params.x, params.y)
    })
  })
  
  console.log('右键菜单创建成功')
}

// 当Electron应用准备好时，创建窗口
app.whenReady().then(() => {
  // 启动FastAPI后端
  startFastApi()
  
  // 创建主窗口
  createWindow()

  // 创建菜单
  createMenu()

  // 在macOS上，当所有窗口关闭时，重新创建窗口
  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
      createMenu()
    }
  })
})

// 当所有窗口关闭时，退出应用
app.on('window-all-closed', () => {
  // 在macOS上，应用和菜单栏通常会保持活动状态，直到用户使用Cmd+Q明确退出
  if (process.platform !== 'darwin') {
    stopFastApi()
    app.quit()
  }
})

// 应用退出前，关闭FastAPI进程
app.on('before-quit', () => {
  stopFastApi()
})

// 设置IPC通信
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    appPath: app.getAppPath()
  }
})

// 添加Electron自动刷新功能
try {require('electron-reloader')(module,{});} catch (_) {}