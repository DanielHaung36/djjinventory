"use server"

import type { InboundTransaction, OutboundTransaction, EditRequest, AuditTrailEntry } from "@/lib/types"

// 模拟数据库操作
const inboundTransactions: InboundTransaction[] = []
const outboundTransactions: OutboundTransaction[] = []
const auditTrail: AuditTrailEntry[] = []
const editRequests: EditRequest[] = []

export async function applyEditRequest(requestId: string, userId: string, userName: string) {
  // 查找编辑请求
  const request = editRequests.find((req) => req.id === requestId)
  if (!request) {
    throw new Error("Edit request not found")
  }

  // 检查请求状态
  if (request.status !== "pending") {
    throw new Error(`Cannot apply ${request.status} edit request`)
  }

  // 查找相关文档
  let document: InboundTransaction | OutboundTransaction | undefined
  if (request.documentType === "inbound") {
    document = inboundTransactions.find((doc) => doc.id === request.documentId)
  } else {
    document = outboundTransactions.find((doc) => doc.id === request.documentId)
  }

  if (!document) {
    throw new Error("Document not found")
  }

  // 应用更改
  const auditChanges: { field: string; oldValue: any; newValue: any }[] = []

  for (const change of request.changes) {
    // 处理项目添加
    if (change.field === "items.add" && change.newValue) {
      document.items.push(change.newValue)
      auditChanges.push({
        field: "items.add",
        oldValue: null,
        newValue: change.newValue,
      })
    }
    // 处理项目删除
    else if (change.field === "items.remove" && change.oldValue) {
      const itemIndex = document.items.findIndex((item) => item.id === change.oldValue.id)
      if (itemIndex !== -1) {
        document.items.splice(itemIndex, 1)
        auditChanges.push({
          field: "items.remove",
          oldValue: change.oldValue,
          newValue: null,
        })
      }
    }
    // 处理项目更新
    else if (change.field.startsWith("items[")) {
      const match = change.field.match(/items\[(\d+)\]\.(.+)/)
      if (match) {
        const index = Number.parseInt(match[1])
        const field = match[2]
        if (document.items[index]) {
          document.items[index][field] = change.newValue
          auditChanges.push({
            field: change.field,
            oldValue: change.oldValue,
            newValue: change.newValue,
          })
        }
      }
    }
    // 处理其他字段更新
    else {
      document[change.field] = change.newValue
      auditChanges.push({
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
      })
    }
  }

  // 更新文档元数据
  document.updatedAt = new Date().toISOString()
  document.updatedBy = userId

  // 更新请求状态
  request.status = "approved"
  request.approvedBy = userId
  request.approvedAt = new Date().toISOString()

  // 创建审计记录
  const auditEntry: AuditTrailEntry = {
    id: `audit-${Date.now()}`,
    documentId: document.id,
    documentType: request.documentType,
    action: "update",
    timestamp: new Date().toISOString(),
    userId,
    userName,
    changes: auditChanges,
    reason: request.reason,
  }

  auditTrail.push(auditEntry)

  return { success: true }
}
