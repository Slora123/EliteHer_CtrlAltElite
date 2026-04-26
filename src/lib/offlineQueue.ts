import localforage from 'localforage'
import { supabase } from './supabase'

export type QueueItemType =
  | 'incident_report'
  | 'evidence_upload'
  | 'sos_event'
  | 'witness_broadcast'

export type QueueItem = {
  id: string
  type: QueueItemType
  createdAt: string
  payload: any
  status: 'queued' | 'retrying' | 'failed'
  lastError?: string
}

const store = localforage.createInstance({ name: 'saaya', storeName: 'offlineQueue' })

function dataUrlToBlob(dataUrl: string) {
  const [meta, base64] = dataUrl.split(',')
  if (!meta || !base64) throw new Error('Invalid queued evidence payload.')
  const mimeMatch = meta.match(/data:(.*?);base64/)
  const mime = mimeMatch?.[1] ?? 'application/octet-stream'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

function uid() {
  return `q_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export async function listQueue(): Promise<QueueItem[]> {
  const keys = await store.keys()
  const items: QueueItem[] = []
  for (const k of keys) {
    const v = await store.getItem<QueueItem>(k)
    if (v) items.push(v)
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function enqueue(type: QueueItemType, payload: any) {
  const item: QueueItem = {
    id: uid(),
    type,
    createdAt: new Date().toISOString(),
    payload,
    status: 'queued',
  }
  await store.setItem(item.id, item)
  return item
}

export async function removeQueueItem(id: string) {
  await store.removeItem(id)
}

export async function retryQueueItem(item: QueueItem) {
  const next: QueueItem = { ...item, status: 'retrying', lastError: undefined }
  await store.setItem(item.id, next)
  try {
    if (item.type === 'incident_report') {
      const { error } = await supabase.from('incidents').insert(item.payload)
      if (error) throw error
    } else if (item.type === 'sos_event') {
      const { error } = await supabase.from('sos_events').insert(item.payload)
      if (error) throw error
    } else if (item.type === 'evidence_upload') {
      const payload = item.payload ?? {}
      const path = payload.path as string | undefined
      const mime = payload.mime as string | undefined
      const dataUrl = payload.dataUrl as string | undefined
      if (!path || !mime || !dataUrl) {
        throw new Error('Queued evidence is missing required fields.')
      }

      const blob = dataUrlToBlob(dataUrl)
      const up = await supabase.storage.from('evidence').upload(path, blob, {
        contentType: mime,
        upsert: true,
      })
      if (up.error) throw up.error

      const { error } = await supabase.from('evidence_files').insert({
        sos_event_id: payload.sos_event_id ?? null,
        incident_id: payload.incident_id ?? null,
        path,
        mime,
      })
      if (error) throw error
    } else {
      // witness_broadcast remains a backend-pluggable placeholder.
      throw new Error('This item type is not yet synced automatically.')
    }

    await store.removeItem(item.id)
    return { ok: true as const }
  } catch (e: any) {
    const failed: QueueItem = {
      ...item,
      status: 'failed',
      lastError: e?.message ?? 'Failed to sync',
    }
    await store.setItem(item.id, failed)
    return { ok: false as const, error: failed.lastError }
  }
}

export async function retryAll() {
  const items = await listQueue()
  const results = []
  for (const it of items) {
    if (it.status === 'queued' || it.status === 'failed') {
      results.push({ id: it.id, ...(await retryQueueItem(it)) })
    }
  }
  return results
}

