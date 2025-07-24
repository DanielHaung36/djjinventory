import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Crown,
  User,
  Shield,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  MoreVertical,
  Filter
} from 'lucide-react'
import { userApi, type User as UserType, type UserDisplay, toUserDisplay } from '../../api/userApi'
import { mockDataTeam } from '../../data/mockData'

// 角色配置 - 适配新的业务角色
const roleConfig: Record<string, any> = {
  super_admin: {
    icon: Crown,
    label: '超级管理员',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200'
  },
  regional_manager: {
    icon: Shield,
    label: '区域经理',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200'
  },
  store_manager: {
    icon: Shield,
    label: '门店经理',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200'
  },
  sales_manager: {
    icon: Users,
    label: '销售经理',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200'
  },
  inventory_manager: {
    icon: Users,
    label: '库存经理',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200'
  },
  procurement_manager: {
    icon: Users,
    label: '采购经理',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200'
  },
  sales_staff: {
    icon: User,
    label: '销售人员',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    borderColor: 'border-cyan-200'
  },
  warehouse_staff: {
    icon: User,
    label: '仓库人员',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200'
  },
  financial_staff: {
    icon: User,
    label: '财务人员',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200'
  },
  viewer: {
    icon: User,
    label: '访问者',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200'
  }
}

const TeamPage: React.FC = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const itemsPerPage = 12

  // 加载用户数据
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      // 连接真实API
      const data = await userApi.getUsers(1, 100)
      // 转换为前端友好的格式
      const displayUsers = data.users.map(user => toUserDisplay(user))
      setUsers(displayUsers)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('无法加载用户数据')
      setUsers(mockDataTeam) // 失败时使用mock数据
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 筛选和搜索
  const filteredUsers = useMemo(() => {
    let filtered = users

    // 按角色筛选 - 支持多角色
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => 
        user.roles?.some(role => role.name === selectedRole)
      )
    }

    // 按搜索词筛选
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        user.contact?.toLowerCase().includes(term) ||
        user.roles?.some(role => role.label?.toLowerCase().includes(term))
      )
    }

    return filtered
  }, [users, selectedRole, searchTerm])

  // 分页数据
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredUsers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // 获取角色统计
  const roleStats = useMemo(() => {
    const stats: Record<string, number> = { all: users.length }
    Object.keys(roleConfig).forEach(role => {
      stats[role] = users.filter(user => 
        user.roles?.some(r => r.name === role)
      ).length
    })
    return stats
  }, [users])

  // 处理用户选择
  const handleUserSelect = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // 处理全选
  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id))
    }
  }

  // 处理删除
  const handleDelete = async () => {
    try {
      setLoading(true)
      // TODO: 调用删除API
      // if (selectedUsers.length === 1) {
      //   await userApi.deleteUser(selectedUsers[0])
      // } else {
      //   await userApi.deleteUsers(selectedUsers)
      // }
      
      // 暂时从本地数据移除
      setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)))
      setSelectedUsers([])
      setShowDeleteDialog(false)
    } catch (err) {
      setError('删除失败')
    } finally {
      setLoading(false)
    }
  }

  // 渲染用户卡片
  const renderUserCard = (user: UserDisplay) => {
    // 获取用户的主要角色（第一个角色）
    const primaryRole = user.roles?.[0]?.name || 'viewer'
    const config = roleConfig[primaryRole] || roleConfig.viewer
    const Icon = config.icon
    const isSelected = selectedUsers.includes(user.id)

    return (
      <div 
        key={user.id}
        className={`bg-white rounded-xl border-2 transition-all duration-200 p-6 cursor-pointer ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onClick={() => handleUserSelect(user.id)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color} border ${config.borderColor}`}>
                {config.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                navigate('/team/edit', { state: { user } })
              }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
            }`}>
              {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2" />
            {user.contact}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            {user.address1}
          </div>
        </div>
      </div>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载用户数据中...</p>
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
            <ChevronLeft className="h-4 w-4" />
            返回
          </button>
        </div>
        
        {/* 标题和操作按钮 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">团队管理</h1>
            <p className="text-gray-600 mt-1">管理团队成员和权限</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={loadUsers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
            
            {selectedUsers.length > 0 && (
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                删除 ({selectedUsers.length})
              </button>
            )}
            
            <button
              onClick={() => navigate('/team/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              添加成员
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex-shrink-0 mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <Trash2 className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 角色统计卡片 */}
      <div className="flex-shrink-0 grid gap-4 grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 mb-6">
        <div 
          className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
            selectedRole === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedRole('all')}
        >
          <div className="flex items-center justify-between">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{roleStats.all}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">全部成员</p>
        </div>

        {Object.entries(roleConfig).map(([role, config]) => {
          const Icon = config.icon
          return (
            <div 
              key={role}
              className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                selectedRole === role ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedRole(role)}
            >
              <div className="flex items-center justify-between">
                <Icon className={`h-5 w-5 ${config.color}`} />
                <span className="text-2xl font-bold text-gray-900">{roleStats[role] || 0}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{config.label}</p>
            </div>
          )
        })}
      </div>

      {/* 搜索和全选 */}
      <div className="flex-shrink-0 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索成员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                全选当前页
              </label>
              
              <div className="text-sm text-gray-500">
                共 {filteredUsers.length} 名成员
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="flex-1 min-h-0">
        {paginatedUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无团队成员</h3>
            <p className="text-gray-500 text-center max-w-sm">
              {searchTerm || selectedRole !== 'all' ? '没有找到符合条件的成员' : '开始添加团队成员'}
            </p>
            {(!searchTerm && selectedRole === 'all') && (
              <button
                onClick={() => navigate('/team/create')}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                添加第一个成员
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginatedUsers.map(renderUserCard)}
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            显示第 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} 名，
            共 {filteredUsers.length} 名成员
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
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNumber
                if (totalPages <= 5) {
                  pageNumber = index + 1
                } else if (currentPage <= 3) {
                  pageNumber = index + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + index
                } else {
                  pageNumber = currentPage - 2 + index
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

      {/* 删除确认对话框 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">确认删除</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              您确定要删除选中的 {selectedUsers.length} 名成员吗？此操作无法撤销。
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamPage