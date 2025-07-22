# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
这是DJJ库存管理系统的React前端应用，使用TypeScript、Vite、React Router、Redux Toolkit和Tailwind CSS构建。项目采用现代React架构模式，包含认证、库存管理、订单处理、报价系统等完整的企业级功能模块。

## Common Commands

### Development
```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### Environment Setup
项目使用环境变量配置，创建`.env`文件设置：
- `VITE_API_HOST` - 后端API地址（如：http://localhost:8080）

## Architecture Overview

### Technology Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6.x
- **Routing**: React Router DOM 7.x
- **State Management**: Redux Toolkit + RTK Query
- **UI Framework**: 
  - Tailwind CSS 4.x for styling
  - shadcn/ui components library
  - Material-UI (@mui/material) for complex components
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts, Nivo charts
- **Development**: ESLint, TypeScript strict mode

### Project Structure
```
src/
├── features/           # 功能模块（按业务领域组织）
│   ├── auth/          # 认证模块（登录、注册、权限）
│   ├── inventory/     # 库存管理
│   ├── products/      # 产品管理
│   ├── sales/         # 销售订单
│   ├── quotes/        # 报价系统
│   ├── customer/      # 客户管理
│   └── dashboard/     # 仪表板
├── components/        # 通用UI组件
├── layout/           # 布局组件
├── routes/           # 路由配置
├── app/              # Redux store配置
├── hooks/            # 自定义hooks
├── lib/              # 工具函数和类型
└── utils/            # 辅助工具
```

### Feature-Based Architecture
项目采用按功能模块组织的架构：
- 每个feature目录包含该业务领域的所有相关文件
- RTK Query用于API状态管理，每个feature有独立的API slice
- 使用TypeScript进行严格的类型检查
- 组件采用复合模式和render props模式

### Key Design Patterns
- **Feature Slicing**: 按业务功能组织代码，提高可维护性
- **API State Management**: 使用RTK Query管理服务器状态
- **Component Composition**: 使用shadcn/ui的复合组件模式
- **Route-based Code Splitting**: 基于路由的代码分割优化
- **Authentication Flow**: JWT token + Redux持久化认证状态

### Routing Architecture
使用React Router DOM的嵌套路由：
- `/` - 重定向到dashboard（需要认证）
- `/login`, `/register` - 认证页面（AuthLayout）
- `/dashboard` - 主仪表板
- `/inventory/*` - 库存管理模块
- `/sales/*` - 销售订单模块
- `/quotes/*` - 报价系统模块
- `/products/*` - 产品管理模块

### State Management Strategy
- **Global State**: Redux Toolkit用于用户认证和应用级状态
- **Server State**: RTK Query用于API数据缓存和同步
- **Local State**: useState/useReducer用于组件级状态
- **Form State**: React Hook Form管理表单状态

### UI Component Strategy
项目混合使用多个UI库：
- **shadcn/ui**: 主要的基础组件库（Button、Dialog、Table等）
- **Material-UI**: 复杂的数据展示组件（DataGrid、DatePicker等）
- **Tailwind CSS**: 自定义样式和布局
- **Lucide Icons**: 图标库

### API Integration
使用RTK Query进行API集成：
- 每个业务模块有独立的API slice（authApi、inventoryApi等）
- 自动缓存和重新验证
- 类型安全的API调用
- 统一的错误处理

### Development Workflow
1. 功能开发遵循feature-first原则
2. 新组件优先使用shadcn/ui，必要时扩展Material-UI
3. 所有API调用通过RTK Query进行
4. 使用TypeScript严格模式，确保类型安全
5. 表单使用React Hook Form + Zod验证

### Code Style Conventions
- 组件文件使用PascalCase命名
- Hook文件以use开头
- API相关文件以Api结尾
- 类型定义在types.ts文件中
- 常量定义在constants目录中

### Testing Strategy
项目当前未配置测试，但推荐添加：
- 单元测试使用Vitest + React Testing Library
- 集成测试使用Playwright
- API测试使用MSW mock

### Performance Considerations
- Vite提供快速的开发体验和优化的生产构建
- React Router实现路由级代码分割
- RTK Query提供智能缓存减少不必要的API调用
- 使用React.memo和useMemo优化重渲染

### Security Features
- JWT token认证机制
- 路由级权限控制（RequireAuth组件）
- HTTPS支持（通过vite-plugin-basic-ssl）
- 环境变量管理敏感配置

### Mobile Support
- 响应式设计使用Tailwind CSS
- 专门的移动端菜单组件
- 条码扫描功能支持移动设备