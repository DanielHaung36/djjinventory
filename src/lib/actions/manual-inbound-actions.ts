// 手动入库相关API操作
export interface ManualInboundItem {
  product_id: number       // 🔥 产品数据库ID
  djj_code: string        // DJJ产品编码
  category: string        // 产品分类
  quantity: number        // 数量
  unit_price: number      // 单价
  vin?: string           // VIN号（Machine类型）
  serial?: string        // 序列号
  add_loan?: boolean     // 是否添加贷款
  remark?: string        // 备注
}

export interface ManualInboundRequest {
  region_id: number
  warehouse_id: number
  reference_number: string
  receipt_date: string
  notes?: string
  items: ManualInboundItem[]
  files?: string[]               // 上传的文件路径列表（兼容旧字段）
  file_paths?: string[]          // 新的文件路径字段
}

export interface ProcessedInboundItem {
  product_id: number
  djj_code: string
  product_name: string
  quantity: number
  unit_price: number
  total_value: number
  before_stock: number
  after_stock: number
  transaction_id: number
  success: boolean
  error_message?: string
}

export interface ManualInboundResponse {
  transaction_id?: number
  reference_number: string
  processed_items: ProcessedInboundItem[]
  total_items: number
  success_items: number
  failed_items: number
  total_value: number
  success: boolean
  message: string
  created_at: string
  operator_id: number
  region_id: number
  warehouse_id: number
  uploaded_files?: string[]    // 成功上传的文件列表
  document_ids?: number[]      // 文档记录ID列表
}

// ===== 查询相关接口 =====

export interface ManualInboundListItem {
  reference_number: string      // 参考号 (如: Manual-20250112-001)
  item_count: number           // 项目数量
  total_quantity: number       // 总数量
  status: string              // 状态 (completed, etc.)
  created_at: string          // 创建时间
  operator: string            // 操作员
}

export interface DocumentInfo {
  id: number
  file_name: string
  file_type: string
  file_url: string
  description: string
  uploaded_at: string
}

export interface InboundRecordItem {
  transaction_id: number
  product_id: number
  product_name: string
  djj_code: string
  quantity: number
  warehouse_name: string
  created_at: string
}

export interface ManualInboundRecord {
  reference_number: string
  status: string
  created_at: string
  total_items: number
  documents: DocumentInfo[]
  items: InboundRecordItem[]
}

export interface PaginationInfo {
  current_page: number
  page_size: number
  total_items: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface ManualInboundListResponse {
  data: ManualInboundListItem[]
  pagination: PaginationInfo
}

// ===== 文件上传相关 =====

/**
 * 上传入库相关文件
 */
export async function uploadInboundFiles(
  files: File[]
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    if (!files || files.length === 0) {
      return {
        success: false,
        error: '请选择要上传的文件'
      }
    }

    console.log('📁 上传入库文件:', files.map(f => f.name))

    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files`, file)
    })

    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ 文件上传响应:', result)

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data.file_paths || []
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || '文件上传失败'
      }
    }
  } catch (error) {
    console.error('❌ 文件上传失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误，请重试'
    }
  }
}

/**
 * 创建手动入库事务
 */
export async function createManualInboundTransaction(
  data: ManualInboundRequest
): Promise<{ success: boolean; data?: ManualInboundResponse; error?: string }> {
  try {
    console.log('🚀 发送手动入库请求:', data)
    
    const response = await fetch('/api/inventory/manual-inbound', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ 手动入库响应:', result)

    // 处理API响应格式
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || '入库处理失败'
      }
    }
  } catch (error) {
    console.error('❌ 手动入库失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误，请重试'
    }
  }
}

// ===== 查询相关API函数 =====

/**
 * 获取手动入库记录列表
 */
export async function getManualInboundList(
  page: number = 1,
  pageSize: number = 20,
  regionId?: number
): Promise<{ success: boolean; data?: ManualInboundListResponse; error?: string }> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    
    if (regionId && regionId > 0) {
      params.append('region_id', regionId.toString())
    }

    console.log('🔍 获取手动入库列表:', { page, pageSize, regionId })
    
    const response = await fetch(`/api/inventory/manual-inbound?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ 手动入库列表响应:', result)

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || '获取入库列表失败'
      }
    }
  } catch (error) {
    console.error('❌ 获取手动入库列表失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误，请重试'
    }
  }
}

/**
 * 获取特定手动入库记录详情
 */
export async function getManualInboundRecord(
  referenceNumber: string
): Promise<{ success: boolean; data?: ManualInboundRecord; error?: string }> {
  try {
    if (!referenceNumber || referenceNumber.trim() === '') {
      return {
        success: false,
        error: '参考号不能为空'
      }
    }

    console.log('🔍 获取入库记录详情:', referenceNumber)
    
    const response = await fetch(`/api/inventory/manual-inbound/${encodeURIComponent(referenceNumber)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 404) {
        return {
          success: false,
          error: '入库记录不存在'
        }
      }
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ 入库记录详情响应:', result)

    if (result.success && result.data) {
      return {
        success: true,
        data: result.data
      }
    } else {
      return {
        success: false,
        error: result.message || result.error || '获取入库记录详情失败'
      }
    }
  } catch (error) {
    console.error('❌ 获取入库记录详情失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '网络错误，请重试'
    }
  }
}

/**
 * 工具函数：格式化日期显示
 */
export function formatInboundDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

/**
 * 工具函数：获取状态显示文本
 */
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'completed': '已完成',
    'processing': '处理中',
    'failed': '失败',
    'pending': '待处理'
  }
  return statusMap[status] || status
}