// src/services/productsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { StockEntry, ProductImage, SalesData, Product } from './productTypes'

// 你后端 ws 路径，比如：ws://localhost:8080/ws/products
const WS_URL = (topic: string) =>
  `${window.location.origin.replace(/^http/, 'ws')}/ws/${topic}`

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Products'],
  endpoints: (builder) => ({
    // 分页拉列表
    getProducts: builder.query<{ total: number; products: Product[] }, { offset: number; limit: number }>({
      query: ({ offset, limit }) => `products?offset=${offset}&limit=${limit}`,
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
        // 等待初次数据加载完
        await cacheDataLoaded

        const socket = new WebSocket(WS_URL('products'))

        socket.onmessage = (evt) => {
          const msg = JSON.parse(evt.data) as {
            event: 'productCreated' | 'productUpdated' | 'productDeleted'
            payload: any
          }

          updateCachedData((draft) => {
            switch (msg.event) {
              case 'productCreated':
                draft.products.unshift(msg.payload)
                draft.total += 1
                break
              case 'productUpdated':
                const idx = draft.products.findIndex((p) => p.id === msg.payload.id)
                if (idx !== -1) draft.products[idx] = msg.payload
                break
              case 'productDeleted':
                draft.products = draft.products.filter((p) => p.id !== msg.payload.id)
                draft.total -= 1
                break
            }
          })
        }

        // 关闭缓存时，关闭 websocket
        await cacheEntryRemoved
        socket.close()
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
