import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface UploadResponse {
  success: boolean
  url: string
  filename: string
  size: number
  message?: string
}

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Upload single file
    uploadFile: builder.mutation<UploadResponse, { file: File; folder?: string }>({
      query: ({ file, folder = "products" }) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", folder)

        return {
          url: "upload",
          method: "POST",
          body: formData,
        }
      },
    }),

    // Upload multiple files
    uploadFiles: builder.mutation<UploadResponse[], { files: File[]; folder?: string }>({
      query: ({ files, folder = "products" }) => {
        const formData = new FormData()
        files.forEach((file, index) => {
          formData.append(`files`, file)
        })
        formData.append("folder", folder)

        return {
          url: "upload/multiple",
          method: "POST",
          body: formData,
        }
      },
    }),

    // Delete uploaded file
    deleteFile: builder.mutation<{ success: boolean; message: string }, string>({
      query: (fileUrl) => ({
        url: "upload/delete",
        method: "DELETE",
        body: { fileUrl },
      }),
    }),
  }),
})

export const { useUploadFileMutation, useUploadFilesMutation, useDeleteFileMutation } = uploadApi
