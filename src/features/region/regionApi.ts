// src/services/regionsApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Company,Warehouse } from '../customer/types';

export interface Region {
  id: number;
  name: string;
  companyId: number;
  company: Company;
  warehouses?: Warehouse[];
  createdAt: string;
  updatedAt: string;
}

export const regionsApi = createApi({
  reducerPath: 'regionsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['REGIONS'],
  endpoints: (builder) => ({
    getRegions: builder.query<Region[], void>({
      query: () => 'regions',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'REGIONS' as const, id })),
        { type: 'REGIONS', id: 'LIST' },
      ],
    }),
    getRegionById: builder.query<Region, number>({
      query: (id) => `regions/${id}`,
      providesTags: (_, __, id) => [{ type: 'REGIONS', id }],
    }),
    createRegion: builder.mutation<Region, Partial<Region>>({
      query: (body) => ({
        url: 'regions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'REGIONS', id: 'LIST' }],
    }),
    updateRegion: builder.mutation<Region, { id: number; body: Partial<Region> }>({
      query: ({ id, body }) => ({
        url: `regions/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (res, err, { id }) => [{ type: 'REGIONS', id }],
    }),
    deleteRegion: builder.mutation<void, number>({
      query: (id) => ({
        url: `regions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (res, err, id) => [
        { type: 'REGIONS', id },
        { type: 'REGIONS', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetRegionByIdQuery,
  useCreateRegionMutation,
  useUpdateRegionMutation,
  useDeleteRegionMutation,
} = regionsApi;
