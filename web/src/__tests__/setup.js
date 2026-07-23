import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

// Mock axios globally
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}))

// Mock vue-router
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      back: vi.fn(),
    })),
    useRoute: vi.fn(() => ({
      params: { id: '1' },
      query: {},
    })),
  }
})

// Mock @/plugins/axios
vi.mock('@/plugins/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock @/stores/auth
vi.mock('@/stores/auth', () => ({
  useAuthStore: vi.fn(() => ({
    user: { id: 1, firstname: 'Test', lastname: 'User' },
    token: 'test-token',
    permissions: [],
    isAuthenticated: true,
    hasPermission: vi.fn(() => true),
  })),
}))

// Mock @/utils/filePreview
vi.mock('@/utils/filePreview', () => ({
  fileUrl: vi.fn((path) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `http://localhost:8002/${path.replace(/^\//, '')}`
  }),
  isImage: vi.fn((path) => /\.(jpg|jpeg|png|gif|webp)$/i.test(path)),
  isPdf: vi.fn((path) => !!path && path.toLowerCase().endsWith('.pdf')),
  isOffice: vi.fn((path) => /\.(pptx|ppt|potx)$/i.test(path)),
  officeViewerUrl: vi.fn((path) => {
    const base = !path ? '' : path.startsWith('http') ? path : `http://localhost:8002/${path.replace(/^\//, '')}`
    return `https://docs.google.com/gview?url=${encodeURIComponent(base)}&embedded=true`
  }),
}))

// Global test setup
config.global.plugins = [createPinia()]
setActivePinia(createPinia())