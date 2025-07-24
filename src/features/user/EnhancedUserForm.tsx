import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Crown,
  Shield,
  Users,
  Eye,
  EyeOff,
  Building,
  Settings,
  CheckSquare,
  Square
} from 'lucide-react'
import { userApi, type Role, type PermissionModule, type Store } from '../../api/userApi'

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  contact: string
  roleIds: number[]
  address1: string
  address2: string
  storeId: number | null
  permissionIds: number[]
  password?: string
  confirmPassword?: string
}

const EnhancedUserForm: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const existingUser = location.state?.user
  const isEdit = !!existingUser

  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    roleIds: [],
    address1: '',
    address2: '',
    storeId: null,
    permissionIds: [],
    password: '',
    confirmPassword: ''
  })

  const [roles, setRoles] = useState<Role[]>([])
  const [permissionModules, setPermissionModules] = useState<PermissionModule[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  // 加载表单数据
  useEffect(() => {
    loadFormData()
  }, [])

  useEffect(() => {
    if (existingUser) {
      setFormData({
        firstName: existingUser.firstName || '',
        lastName: existingUser.lastName || '',
        email: existingUser.email || '',
        contact: existingUser.contact || '',
        roleIds: existingUser.roles?.map((r: any) => r.id) || [],
        address1: existingUser.address1 || '',
        address2: existingUser.address2 || '',
        storeId: existingUser.storeId || null,
        permissionIds: existingUser.permissions?.map((p: any) => p.id) || [],
        password: '',
        confirmPassword: ''
      })
    }
  }, [existingUser])

  const loadFormData = async () => {
    try {
      setDataLoading(true)
      const [rolesData, permissionsData, storesData] = await Promise.all([
        userApi.getRoles(),
        userApi.getPermissionModules(),
        userApi.getStores()
      ])
      
      setRoles(rolesData)
      setPermissionModules(permissionsData)
      setStores(storesData)
    } catch (error) {
      console.error('Error loading form data:', error)
      setErrors({ load: '加载表单数据失败' })
    } finally {
      setDataLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleRoleToggle = (roleId: number) => {
    const newRoleIds = formData.roleIds.includes(roleId)
      ? formData.roleIds.filter(id => id !== roleId)
      : [...formData.roleIds, roleId]
    
    handleInputChange('roleIds', newRoleIds)

    // 自动添加角色关联的权限
    const role = roles.find(r => r.id === roleId)
    if (role?.permissions && !formData.roleIds.includes(roleId)) {
      const rolePermissionIds = role.permissions.map(p => p.id)
      const newPermissionIds = Array.from(new Set([...formData.permissionIds, ...rolePermissionIds]))
      handleInputChange('permissionIds', newPermissionIds)
    }
  }

  const handlePermissionToggle = (permissionId: number) => {
    const newPermissionIds = formData.permissionIds.includes(permissionId)
      ? formData.permissionIds.filter(id => id !== permissionId)
      : [...formData.permissionIds, permissionId]
    
    handleInputChange('permissionIds', newPermissionIds)
  }

  const handleModuleToggle = (modulePermissions: any[]) => {
    const modulePermissionIds = modulePermissions.map(p => p.id)
    const allSelected = modulePermissionIds.every(id => formData.permissionIds.includes(id))
    
    if (allSelected) {
      // 取消选择所有模块权限
      const newPermissionIds = formData.permissionIds.filter(id => !modulePermissionIds.includes(id))
      handleInputChange('permissionIds', newPermissionIds)
    } else {
      // 选择所有模块权限
      const newPermissionIds = Array.from(new Set([...formData.permissionIds, ...modulePermissionIds]))
      handleInputChange('permissionIds', newPermissionIds)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = '请输入姓名'
    if (!formData.lastName.trim()) newErrors.lastName = '请输入姓氏'
    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }
    if (!formData.contact.trim()) newErrors.contact = '请输入联系电话'
    if (formData.roleIds.length === 0) newErrors.roleIds = '请至少选择一个角色'
    if (!formData.address1.trim()) newErrors.address1 = '请输入地址'
    if (!formData.storeId) newErrors.storeId = '请选择门店'

    // 密码验证
    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = '请输入密码'
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6位'
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = '请确认密码'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致'
      }
    } else if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = '密码至少6位'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      if (isEdit) {
        const updateData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contact: formData.contact,
          roleIds: formData.roleIds,
          address1: formData.address1,
          address2: formData.address2,
          storeId: formData.storeId!,
          permissionIds: formData.permissionIds,
          ...(formData.password && { password: formData.password })
        }
        await userApi.updateUser(existingUser.id, updateData)
      } else {
        const createData = {
          username: `${formData.firstName}${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contact: formData.contact,
          roleIds: formData.roleIds,
          address1: formData.address1,
          address2: formData.address2,
          storeId: formData.storeId!,
          permissionIds: formData.permissionIds,
          password: formData.password!
        }
        await userApi.createUser(createData)
      }
      navigate('/team')
    } catch (error) {
      console.error('Error saving user:', error)
      setErrors({ submit: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载表单数据中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto">
      {/* 头部 */}
      <div className="flex-shrink-0 mb-6">
        <div className="mb-4">
          <button
            onClick={() => navigate('/team')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回团队管理
          </button>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isEdit ? '编辑成员' : '添加成员'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? '修改团队成员信息和权限' : '添加新的团队成员并分配权限'}
          </p>
        </div>
      </div>

      {/* 选项卡 */}
      <div className="flex-shrink-0 mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'basic', label: '基本信息', icon: User },
              { key: 'roles', label: '角色分配', icon: Crown },
              { key: 'permissions', label: '权限管理', icon: Settings },
              { key: 'store', label: '门店分配', icon: Building }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          {/* 基本信息 */}
          {activeTab === 'basic' && (
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  姓名 *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入姓名"
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓氏 *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入姓氏"
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  邮箱 *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入邮箱"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  联系电话 *
                </label>
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contact ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入联系电话"
                />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  地址1 *
                </label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => handleInputChange('address1', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.address1 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="请输入地址"
                />
                {errors.address1 && <p className="text-red-500 text-xs mt-1">{errors.address1}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">地址2</label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => handleInputChange('address2', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入地址2（可选）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="inline h-4 w-4 mr-1" />
                  {isEdit ? '新密码（留空不修改）' : '密码 *'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={isEdit ? '留空不修改密码' : '请输入密码'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isEdit ? '确认新密码' : '确认密码 *'}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="请确认密码"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          )}

          {/* 角色分配 */}
          {activeTab === 'roles' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">选择用户角色 *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map(role => {
                  const isSelected = formData.roleIds.includes(role.id)
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleToggle(role.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{role.label}</h4>
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{role.description || `${role.label}角色`}</p>
                      {role.permissions && (
                        <p className="text-xs text-gray-500 mt-2">
                          包含 {role.permissions.length} 个权限
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              {errors.roleIds && <p className="text-red-500 text-sm mt-2">{errors.roleIds}</p>}
            </div>
          )}

          {/* 权限管理 */}
          {activeTab === 'permissions' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">权限管理</h3>
              <p className="text-sm text-gray-600 mb-6">
                除了角色自带的权限外，您还可以为用户分配额外的权限
              </p>
              
              <div className="space-y-6">
                {permissionModules.map(module => {
                  const modulePermissionIds = module.permissions.map(p => p.id)
                  const selectedCount = modulePermissionIds.filter(id => 
                    formData.permissionIds.includes(id)
                  ).length
                  const allSelected = selectedCount === modulePermissionIds.length
                  const someSelected = selectedCount > 0 && selectedCount < modulePermissionIds.length

                  return (
                    <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => handleModuleToggle(module.permissions)}
                        >
                          {allSelected ? (
                            <CheckSquare className="h-5 w-5 text-blue-600 mr-2" />
                          ) : someSelected ? (
                            <div className="h-5 w-5 border-2 border-blue-600 bg-blue-600 mr-2 flex items-center justify-center">
                              <div className="h-2 w-2 bg-white"></div>
                            </div>
                          ) : (
                            <Square className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <h4 className="font-medium text-gray-900">{module.label}</h4>
                        </div>
                        <span className="text-sm text-gray-500">
                          {selectedCount}/{modulePermissionIds.length} 已选择
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 ml-7">
                        {module.permissions.map(permission => {
                          const isSelected = formData.permissionIds.includes(permission.id)
                          return (
                            <label
                              key={permission.id}
                              className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{permission.label}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 门店分配 */}
          {activeTab === 'store' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">门店分配 *</h3>
              <p className="text-sm text-gray-600 mb-6">
                为用户分配所属门店，用户只能管理其所属门店的数据
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map(store => {
                  const isSelected = formData.storeId === store.id
                  return (
                    <div
                      key={store.id}
                      onClick={() => handleInputChange('storeId', store.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!store.isActive ? 'opacity-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Building className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                        {isSelected && <CheckSquare className="h-5 w-5 text-blue-600" />}
                      </div>
                      <h4 className="font-medium text-gray-900">{store.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{store.address}</p>
                      {!store.isActive && (
                        <p className="text-xs text-red-500 mt-1">门店已停用</p>
                      )}
                    </div>
                  )
                })}
              </div>
              {errors.storeId && <p className="text-red-500 text-sm mt-2">{errors.storeId}</p>}
            </div>
          )}

          {/* 提交错误 */}
          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* 按钮 */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {loading ? '保存中...' : (isEdit ? '更新' : '创建')}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EnhancedUserForm