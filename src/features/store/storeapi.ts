    import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Store } from '../customer/types'

export const storeapi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['STORES'],
  endpoints: (builder) => ({
    // ✅ 获取所有门店
    getStores: builder.query<Store[], void>({
      query: () => 'stores',
      providesTags: (res = []) => [
        ...res.map(store => ({ type: 'STORES' as const, id: store.id })),
        { type: 'STORES', id: 'LIST' },
      ],
    }),

    // ✅ 获取单个门店
    getStoreById: builder.query<Store, number>({
      query: (id) => `stores/${id}`,
      providesTags: (res, err, id) => [{ type: 'STORES', id }],
    }),

    // ✅ 创建门店
    createStore: builder.mutation<Store, Partial<Store>>({
      query: (body) => ({
        url: 'stores',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'STORES', id: 'LIST' }],
    }),

    // ✅ 更新门店
    updateStore: builder.mutation<Store, { id: number; body: Partial<Store> }>({
      query: ({ id, body }) => ({
        url: `stores/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: 'STORES', id }],
    }),

    // ✅ 删除门店
    deleteStore: builder.mutation<void, number>({
      query: (id) => ({
        url: `stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (res, err, id) => [{ type: 'STORES', id }, { type: 'STORES', id: 'LIST' }],
    }),
  }),
})

// ✅ 自动导出 Hooks
export const {
  useGetStoresQuery,
  useGetStoreByIdQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storeapi
