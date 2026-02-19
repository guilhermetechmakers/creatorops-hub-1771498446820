import { supabase } from '@/lib/supabase'
import type { FileUploadManagement, FileAsset } from '@/types/database'

const BUCKET = 'assets'

export interface PresignedUploadResponse {
  asset_id: string
  path: string
  upload_url: string | null
  token: string | null
  use_direct_upload: boolean
}

export interface PresignedDownloadResponse {
  signed_url: string
}

export const fileUploadManagementService = {
  async listFolders(userId: string): Promise<FileUploadManagement[]> {
    const { data, error } = await supabase
      .from('file_upload_management')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  async createFolder(
    userId: string,
    payload: { title: string; description?: string }
  ): Promise<FileUploadManagement> {
    const { data, error } = await supabase
      .from('file_upload_management')
      .insert({
        user_id: userId,
        title: payload.title,
        description: payload.description ?? null,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateFolder(
    id: string,
    userId: string,
    payload: Partial<{ title: string; description: string; status: string }>
  ): Promise<FileUploadManagement> {
    const { data, error } = await supabase
      .from('file_upload_management')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteFolder(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('file_upload_management')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },

  async listAssets(
    userId: string,
    options?: { folder_id?: string; limit?: number; offset?: number; search?: string }
  ): Promise<FileAsset[]> {
    let query = supabase
      .from('file_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (options?.folder_id) {
      query = query.eq('folder_id', options.folder_id)
    }
    if (options?.search) {
      query = query.ilike('filename', `%${options.search}%`)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getAssetById(id: string, userId: string): Promise<FileAsset | null> {
    const { data, error } = await supabase
      .from('file_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  },

  async getPresignedUploadUrl(
    accessToken: string,
    payload: { filename: string; content_type: string; size_bytes?: number; folder_id?: string }
  ): Promise<PresignedUploadResponse> {
    const { data, error } = await supabase.functions.invoke('storage-presigned-upload', {
      body: payload,
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return data as PresignedUploadResponse
  },

  async uploadFile(
    accessToken: string,
    file: File,
    folderId?: string
  ): Promise<FileAsset> {
    const presigned = await this.getPresignedUploadUrl(accessToken, {
      filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      folder_id: folderId,
    })

    if (presigned.use_direct_upload || !presigned.upload_url) {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(presigned.path, file, {
          contentType: file.type,
          upsert: false,
        })

      if (error) throw error
    } else {
      const uploadRes = await fetch(presigned.upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!uploadRes.ok) {
        throw new Error('Upload failed')
      }
    }

    await supabase.functions.invoke('storage-confirm-upload', {
      body: { asset_id: presigned.asset_id, size_bytes: file.size },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    const { data: asset } = await supabase
      .from('file_assets')
      .select('*')
      .eq('id', presigned.asset_id)
      .single()

    if (!asset) throw new Error('Asset not found after upload')
    return asset as FileAsset
  },

  async getPresignedDownloadUrl(
    accessToken: string,
    path: string
  ): Promise<string> {
    const { data, error } = await supabase.functions.invoke('storage-presigned-download', {
      body: { path },
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
    return (data as PresignedDownloadResponse).signed_url
  },

  async getPublicUrl(path: string): Promise<string> {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    return data.publicUrl
  },

  async updateAsset(
    id: string,
    userId: string,
    payload: Partial<{ tags: string[]; folder_id: string | null }>
  ): Promise<FileAsset> {
    const { data, error } = await supabase
      .from('file_assets')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteAsset(id: string, userId: string): Promise<void> {
    const asset = await this.getAssetById(id, userId)
    if (!asset) throw new Error('Asset not found')

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([asset.storage_path])

    if (storageError) throw storageError

    const { error } = await supabase
      .from('file_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  },
}
