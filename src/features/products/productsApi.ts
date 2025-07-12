// src/services/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { StockEntry, ProductImage, SalesData, Product } from './productTypes'

// 你后端 ws 路径，比如：ws://localhost:8080/ws/products
// const WS_URL = (topic: string) =>
//   `${import.meta.env.VITE_API_HOST.replace(/^http/, 'ws')}/ws/${topic}`
const WS_URL = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/products`
console.log(WS_URL);
export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    // 分页拉列表，支持搜索和过滤
    getProducts: builder.query<{ total: number; products: Product[] }, { 
      offset: number; 
      limit: number;
      search?: string;
      category?: string;
      status?: string;
    }>({
      query: ({ offset, limit, search, category, status }) => {
        const params = new URLSearchParams({
          offset: offset.toString(),
          limit: limit.toString(),
        })
        
        if (search && search.trim()) {
          params.append('search', search.trim())
        }
        if (category && category !== 'all') {
          params.append('category', category)
        }
        if (status && status !== 'all') {
          params.append('status', status)
        }
        
        return `products?${params.toString()}`
      },
      providesTags: (res) =>
        res
          ? [
              ...res.products.map((p) => ({ type: 'Products' as const, id: p.id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
      // === websocket 实时更新 ===
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          // 等待初次数据加载完
          await cacheDataLoaded
          const socket = new WebSocket(WS_URL)

          socket.onmessage = (evt) => {
            console.log('🔄 WebSocket收到数据:', evt.data)
            
            try {
              const msg = JSON.parse(evt.data) as {
                event: 'productCreated' | 'productUpdated' | 'productDeleted'
                payload: any
              }
              
              console.log('📦 解析后的消息:', msg)
              console.log(`🎯 事件类型: ${msg.event}`)
              console.log('📋 载荷数据:', msg.payload)

              updateCachedData((draft) => {
                console.log(`🔧 更新缓存数据，事件: ${msg.event}`)
                switch (msg.event) {
                  case 'productCreated':
                    draft.products.unshift(msg.payload)
                    draft.total += 1
                    console.log('✅ 新产品已添加到列表顶部')
                    break
                  case 'productUpdated':
                    const idx = draft.products.findIndex((p) => p.id === msg.payload.id)
                    if (idx !== -1) {
                      draft.products[idx] = msg.payload
                      console.log(`✅ 产品已更新，索引: ${idx}`)
                    } else {
                      console.log('⚠️ 未找到要更新的产品')
                    }
                    break
                  case 'productDeleted':
                    const beforeCount = draft.products.length
                    draft.products = draft.products.filter((p) => p.id !== msg.payload.id)
                    draft.total -= 1
                    console.log(`✅ 产品已删除，删除前: ${beforeCount}, 删除后: ${draft.products.length}`)
                    break
                  default:
                    console.log('❓ 未知的事件类型:', msg.event)
                }
              })
            } catch (error) {
              console.error('❌ WebSocket消息解析失败:', error)
              console.log('原始数据:', evt.data)
            }
          }

          socket.onerror = (error) => {
            console.warn('WebSocket连接失败，将禁用实时更新:', error)
            console.log('WebSocket URL:', WS_URL)
            console.log('WebSocket readyState:', socket.readyState)
          }

          socket.onopen = () => {
            console.log('WebSocket连接成功!')
          }

          socket.onclose = (event) => {
            console.log('WebSocket连接关闭:', event.code, event.reason)
          }

          // 关闭缓存时，关闭 websocket
          await cacheEntryRemoved
          socket.close()
        } catch (error) {
          console.warn('WebSocket初始化失败，将禁用实时更新:', error)
        }
      },
    }),

    // 单条查询
    getProduct: builder.query<Product, number>({
      query: (id) => `products/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Products', id }],
    }),

    // 新建
    createProduct: builder.mutation<Product, Omit<Product, 'id' | 'version' | 'created_at' | 'updated_at'>>({
      query: (body) => ({
        url: 'products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }],
    }),

    // 更新
    updateProduct: builder.mutation<Product, { id: number; body: Partial<Product> }>({
      query: ({ id, body }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: 'Products', id }],
    }),

    // 删除
    deleteProduct: builder.mutation<void, number>({
      query: (id) => ({
        url: `products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Products', id },
        { type: 'Products', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi
