// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import type { Customer } from '../types'

// export const customerApi = createApi({
//   reducerPath: 'customerApi',
//   baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
//   tagTypes: ['Customer'],
//   endpoints: (builder) => ({
//     getCustomers: builder.query<Customer[], void>({
//       query: () => 'customers',
//       providesTags: (result = []) => [
//         ...result.map(({ id }) => ({ type: 'Customer' as const, id })),
//         { type: 'Customer', id: 'LIST' },
//       ],
//     }),
//     getCustomer: builder.query<Customer, number>({
//       query: (id) => `customers/${id}`,
//       providesTags: (result, error, id) => [{ type: 'Customer', id }],
//     }),
//     createCustomer: builder.mutation<Customer, Partial<Customer>>({
//       query: (body) => ({ url: 'customers', method: 'POST', body }),
//       invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
//     }),
//     updateCustomer: builder.mutation<Customer, Partial<Customer> & Pick<Customer, 'id'>>({
//       query: ({ id, ...patch }) => ({ url: `customers/${id}`, method: 'PUT', body: patch }),
//       invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
//     }),
//     deleteCustomer: builder.mutation<void, number>({
//       query: (id) => ({ url: `customers/${id}`, method: 'DELETE' }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'Customer', id },
//         { type: 'Customer', id: 'LIST' },
//       ],
//     }),
//   }),
// })

// export const {
//   useGetCustomersQuery,
//   useGetCustomerQuery,
//   useCreateCustomerMutation,
//   useUpdateCustomerMutation,
//   useDeleteCustomerMutation,
// } = customerApi


// src/services/customerApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Customer } from './types'

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => 'customers',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Customer' as const, id })),
        { type: 'Customer', id: 'LIST' },
      ],
      // —— 关键：建立 WS 连接，监听 “customersCreated/Updated/Deleted” 事件 —— 
      async onCacheEntryAdded(
        _arg,
        {
          updateCachedData,
          cacheDataLoaded,
          cacheEntryRemoved
        }
      ) {
        // 等待初次请求完成
        await cacheDataLoaded
        // 建立 ws 连接到 /ws/customers
        const wsUrl = `${import.meta.env.VITE_API_HOST.replace(/^https/, 'wss').replace(/^http/, 'ws')}/ws/customers`
        const ws = new WebSocket(wsUrl)
        ws.onmessage = ({ data }) => {
          const msg = JSON.parse(data) as {
            event: 'customersCreated' | 'customersUpdated' | 'customersDeleted'
            payload: Customer
          }
          updateCachedData(draft => {
            switch (msg.event) {
              case 'customersCreated':
                draft.push(msg.payload)
                break
              case 'customersUpdated': {
                const i = draft.findIndex(c => c.id === msg.payload.id)
                if (i !== -1) draft[i] = msg.payload
                break
              }
              case 'customersDeleted':
                return draft.filter(c => c.id !== msg.payload.id)
            }
          })
        }
        // cache 销毁时，断开 ws
        await cacheEntryRemoved
        ws.close()
      }
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (body) => ({ url: 'customers', method: 'POST', body }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<Customer, Partial<Customer> & Pick<Customer, 'id'>>({
      query: ({ id, ...patch }) => ({ url: `customers/${id}`, method: 'PUT', body: patch }),
      invalidatesTags: (res, err, { id }) => [{ type: 'Customer', id }],
    }),
    deleteCustomer: builder.mutation<void, number>({
      query: (id) => ({ url: `customers/${id}`, method: 'DELETE' }),
      invalidatesTags: (res, err, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi
