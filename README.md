# 3D THREE

一个 React + Three.js 3D 工作台与 Node.js + TypeScript API 的学习型 monorepo。可在浏览器导入 GLB/GLTF、编辑模型/灯光/相机，并将场景配置保存到本地项目数据。

## 启动

首次安装依赖：

```powershell
npm install
```

在两个终端分别启动 API 与前端：

```powershell
npm run dev:api
npm run dev:web
```

- Web 工作台：通常为 `http://localhost:5173`
- Node API：`http://127.0.0.1:3000`
- API 健康检查：`http://127.0.0.1:3000/api/health`

## 当前能力

- GLB / GLTF 模型导入与自动取景
- 鼠标视口控制：左键旋转、右键平移、滚轮缩放
- Blender 风格 Gizmo：`G` 移动、`R` 旋转、`S` 缩放
- 添加、选择、移动和删除灯光与额外相机
- 灯光颜色、强度及相机位置编辑
- Node API 保存项目 JSON，以及加载最近保存的场景配置

> 恢复项目会还原场景参数；浏览器出于安全原因无法自动重新读取本地模型文件，因此需要手动重新导入模型。

## 目录

```text
apps/
  web/       React + Vite + Three.js 前端
  api/       Fastify + TypeScript Node API
packages/
  shared/    前后端共享的场景数据类型
```

## 数据保存

第一版 API 将项目写入 `apps/api/data/projects.json`。这是为了清晰展示路由、请求校验与文件持久化；后续可以将该实现替换为 SQLite 或 PostgreSQL。

## 常用命令

```powershell
npm run format
npm run build
npm run dev:web
npm run dev:api
```
