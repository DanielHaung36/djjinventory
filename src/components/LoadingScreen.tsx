import React from 'react'
import { RefreshCw } from 'lucide-react'

interface LoadingScreenProps {
  title?: string
  description?: string
  className?: string
}

/**
 * 全屏加载组件
 * 用于页面级数据加载时显示友好的加载界面
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "加载中",
  description = "正在获取最新数据...",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-4 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}

/**
 * 小尺寸加载组件
 * 用于组件内部加载状态
 */
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = "",
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  return (
    <RefreshCw className={`${sizeClasses[size]} text-blue-600 animate-spin ${className}`} />
  )
}

/**
 * 卡片加载骨架
 * 用于表格或卡片列表的加载状态
 */
export const LoadingSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className = "",
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingScreen