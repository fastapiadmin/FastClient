from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，在生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# 任务模型
class Task(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: int = 1  # 1-低, 2-中, 3-高

# 模拟数据库
fake_db: List[Task] = [
    Task(id=1, title="学习FastAPI", description="学习FastAPI框架", completed=False, priority=2),
    Task(id=2, title="开发Vue3组件", description="开发Vue3组件库", completed=True, priority=3),
    Task(id=3, title="打包Electron应用", description="打包Electron桌面应用", completed=False, priority=1),
]

# 根路径
@app.get("/")
async def root():
    return {"message": "任务管理系统API", "total_tasks": len(fake_db)}

# 获取所有任务
@app.get("/tasks", response_model=List[Task])
async def get_tasks(completed: Optional[bool] = None, priority: Optional[int] = None):
    result = fake_db
    if completed is not None:
        result = [task for task in result if task.completed == completed]
    if priority is not None:
        result = [task for task in result if task.priority == priority]
    return result

# 获取单个任务
@app.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int):
    task = next((task for task in fake_db if task.id == task_id), None)
    if task is None:
        raise HTTPException(status_code=404, detail="任务未找到")
    return task

# 创建任务
@app.post("/tasks", response_model=Task)
async def create_task(task: Task):
    # 生成新ID
    new_id = max(task.id for task in fake_db) + 1 if fake_db else 1
    new_task = Task(
        id=new_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority
    )
    fake_db.append(new_task)
    return new_task

# 更新任务
@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task: Task):
    index = next((i for i, t in enumerate(fake_db) if t.id == task_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="任务未找到")
    
    fake_db[index] = Task(
        id=task_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority
    )
    return fake_db[index]

# 删除任务
@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    index = next((i for i, t in enumerate(fake_db) if t.id == task_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="任务未找到")
    
    fake_db.pop(index)
    return {"message": "任务已删除"}

# 完成任务
@app.patch("/tasks/{task_id}/complete", response_model=Task)
async def complete_task(task_id: int):
    index = next((i for i, t in enumerate(fake_db) if t.id == task_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="任务未找到")
    
    fake_db[index].completed = True
    return fake_db[index]

# 取消完成任务
@app.patch("/tasks/{task_id}/uncomplete", response_model=Task)
async def uncomplete_task(task_id: int):
    index = next((i for i, t in enumerate(fake_db) if t.id == task_id), None)
    if index is None:
        raise HTTPException(status_code=404, detail="任务未找到")
    
    fake_db[index].completed = False
    return fake_db[index]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
