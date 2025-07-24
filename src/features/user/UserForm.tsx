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
  EyeOff
} from 'lucide-react'
import { userApi } from '../../api/userApi'

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  contact: string
  role: string
  address1: string
  address2: string
  password?: string
  confirmPassword?: string
}

const roles = [
  { value: 'admin', label: '管理员', icon: Crown, color: 'text-red-600' },
  { value: 'manager', label: '经理', icon: Shield, color: 'text-blue-600' },
  { value: 'staff', label: '员工', icon: Users, color: 'text-green-600' },
  { value: 'user', label: '用户', icon: User, color: 'text-gray-600' }
]

const UserForm: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const existingUser = location.state?.user
  const isEdit = !!existingUser

  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    role: 'user',
    address1: '',
    address2: '',
    password: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (existingUser) {
      setFormData({
        firstName: existingUser.firstName || '',
        lastName: existingUser.lastName || '',
        email: existingUser.email || '',
        contact: existingUser.contact || '',
        role: existingUser.role || 'user',
        address1: existingUser.address1 || '',
        address2: existingUser.address2 || '',
        password: '',
        confirmPassword: ''
      })
    }
  }, [existingUser])

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // 清除错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = '请输入姓名'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = '请输入姓氏'
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址'
    }

    if (!formData.contact.trim()) {
      newErrors.contact = '请输入联系电话'
    }

    if (!formData.role) {
      newErrors.role = '请选择角色'
    }

    if (!formData.address1.trim()) {
      newErrors.address1 = '请输入地址'
    }

    // 密码验证（仅新增时必填）
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
      // 编辑时，如果填写了密码则需要验证
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
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      if (isEdit) {
        // 更新用户
        const updateData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contact: formData.contact,
          role: formData.role,
          address1: formData.address1,
          address2: formData.address2
        }
        
        if (formData.password) {
          updateData.password = formData.password
        }

        // TODO: 调用更新API
        // await userApi.updateUser(existingUser.id, updateData)
        console.log('Update user:', updateData)
      } else {
        // 创建新用户
        const createData = {
          username: `${formData.firstName}${formData.lastName}`,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contact: formData.contact,
          role: formData.role,
          address1: formData.address1,
          address2: formData.address2,
          password: formData.password!
        }

        // TODO: 调用创建API
        // await userApi.createUser(createData)
        console.log('Create user:', createData)
      }

      // 成功后返回列表页
      navigate('/team')
    } catch (error) {
      console.error('Error saving user:', error)
      setErrors({ submit: '保存失败，请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
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
            {isEdit ? '修改团队成员信息' : '添加新的团队成员'}
          </p>
        </div>
      </div>

      {/* 表单 */}
      <div className="flex-1">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 姓名 */}
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
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* 姓氏 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓氏 *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="请输入姓氏"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* 邮箱 */}
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
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* 联系电话 */}
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
              {errors.contact && (
                <p className="text-red-500 text-xs mt-1">{errors.contact}</p>
              )}
            </div>

            {/* 角色 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                角色 *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {roles.map(role => {
                  const Icon = role.icon
                  const isSelected = formData.role === role.value
                  return (
                    <div
                      key={role.value}
                      onClick={() => handleInputChange('role', role.value)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <Icon className={`h-8 w-8 mb-2 ${role.color}`} />
                        <span className="text-sm font-medium text-gray-900">
                          {role.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* 地址1 */}
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
              {errors.address1 && (
                <p className="text-red-500 text-xs mt-1">{errors.address1}</p>
              )}
            </div>

            {/* 地址2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地址2
              </label>
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => handleInputChange('address2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入地址2（可选）"
              />
            </div>

            {/* 密码 */}
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
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* 确认密码 */}
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
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

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

export default UserForm