import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Clock,
  Package,
  FileText,
  Users,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react'
import { dashboardApi } from '../../api/dashboardApi'
import type { DashboardActivity } from '../../api/dashboardApi'

// 图标映射
const iconMap = {
  CheckCircle,
  Package,
  Clock,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp,
  Activity
}

// 活动类型配置
const activityTypeConfig = {
  approved: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    label: '已批准'
  },
  pending: {
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    label: '待处理'
  },
  rejected: {
    color: 'text-red-600',
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-200',
    label: '已拒绝'
  },
  created: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200', 
    label: '已创建'
  },
  updated: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    label: '已更新'
  }
}

const ActivityPage: React.FC = () => {
  const navigate = useNavigate()
  const [allActivities, setAllActivities] = useState<DashboardActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // 加载活动数据
  const loadActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await dashboardApi.getRecentActivities(50) // 获取更多数据用于分页
      
      if (Array.isArray(data)) {
        setAllActivities(data)
      } else if (data && Array.isArray(data.data)) {
        setAllActivities(data.data)
      } else {
        console.warn('Activities data is not an array:', data)
        setAllActivities([])
      }
    } catch (err) {
      console.error('Error loading activities:', err)
      setError('无法加载活动记录')
      setAllActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadActivities()
  }, [])

  // 筛选和搜索
  const filteredActivities = useMemo(() => {
    let filtered = allActivities

    // 按类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType)
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }, [allActivities, selectedType, searchTerm])

  // 分页数据
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredActivities.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredActivities, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)

  // 格式化时间
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes <= 0 ? '刚刚' : `${diffInMinutes} 分钟前`
    } else if (diffInHours < 24) {
      return `${diffInHours} 小时前`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      if (diffInDays < 7) {
        return `${diffInDays} 天前`
      } else {
        return date.toLocaleDateString('zh-CN', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    }
  }

  // 获取活动类型数量统计
  const activityStats = useMemo(() => {
    const stats = { all: allActivities.length }
    Object.keys(activityTypeConfig).forEach(type => {
      stats[type] = allActivities.filter(activity => activity.type === type).length
    })
    return stats
  }, [allActivities])

  // 渲染活动项
  const renderActivityItem = (activity: DashboardActivity) => {
    const Icon = iconMap[activity.icon as keyof typeof iconMap] || Activity
    const config = activityTypeConfig[activity.type as keyof typeof activityTypeConfig] || {
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      label: activity.type
    }

    return (
      <div key={activity.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
        <div className="flex items-start space-x-4">
          {/* 图标 */}
          <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                {activity.message}
              </p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor} flex-shrink-0 ml-3`}>
                {config.label}
              </span>
            </div>
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(activity.time)}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载活动记录中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto">
      {/* 头部 */}
      <div className="flex-shrink-0 mb-6">
        {/* 返回按钮 */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
        </div>
        
        {/* 标题和刷新按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">系统活动记录</h1>
            <p className="text-gray-600 mt-1">查看所有系统操作和更新记录</p>
          </div>
          <button 
            onClick={loadActivities}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex-shrink-0 mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 统计卡片 */}
      <div className="flex-shrink-0 grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 mb-6">
        <div 
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
            selectedType === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedType('all')}
        >
          <div className="flex items-center justify-between">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{activityStats.all}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">全部活动</p>
        </div>

        {Object.entries(activityTypeConfig).map(([type, config]) => (
          <div 
            key={type}
            className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
              selectedType === type ? `border-blue-500 bg-blue-50` : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedType(type)}
          >
            <div className="flex items-center justify-between">
              <div className={`p-1 rounded ${config.bgColor}`}>
                <div className={`h-3 w-3 ${config.color}`}></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{activityStats[type] || 0}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{config.label}</p>
          </div>
        ))}
      </div>

      {/* 搜索和筛选 */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索活动记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-500">
              共 {filteredActivities.length} 条记录
            </div>
          </div>
        </div>
      </div>

      {/* 活动列表 */}
      <div className="flex-1 min-h-0">
        {!Array.isArray(paginatedActivities) || paginatedActivities.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无活动记录</h3>
            <p className="text-gray-500 text-center max-w-sm">
              {searchTerm || selectedType !== 'all' ? '没有找到符合条件的活动记录' : '系统活动记录将在这里显示'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedActivities.map(renderActivityItem)}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredActivities.length)} 条，
            共 {filteredActivities.length} 条记录
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              上一页
            </button>

            <div className="flex items-center gap-1">
              {[...Array(Math.min(totalPages, 7))].map((_, index) => {
                let pageNumber
                if (totalPages <= 7) {
                  pageNumber = index + 1
                } else if (currentPage <= 4) {
                  pageNumber = index + 1
                } else if (currentPage >= totalPages - 3) {
                  pageNumber = totalPages - 6 + index
                } else {
                  pageNumber = currentPage - 3 + index
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`px-3 py-2 text-sm rounded-lg ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityPage