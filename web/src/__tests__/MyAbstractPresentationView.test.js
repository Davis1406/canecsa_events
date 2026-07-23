import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyAbstractPresentationView from '@/pages/my_account/MyAbstractPresentationView.vue'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios')

describe('MyAbstractPresentationView', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Abstract Presentation')
  })

  it('shows loading state initially', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    wrapper = mount(MyAbstractPresentationView)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows empty state when no presentations', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('No accepted, paid abstracts yet.')
  })

  it('displays presentation items when available', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Test Presentation')
    expect(wrapper.text()).toContain('Test Event')
    expect(wrapper.text()).toContain('oral')
  })

  it('shows oral presentation instructions', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('10 minutes per presenter')
  })

  it('shows poster presentation instructions', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Poster',
      event_name: 'Test Event',
      presentation_type: 'poster',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('PDF or image')
  })

  it('displays templates when available', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [{
        id: 1,
        name: 'Oral Template',
        url: '/templates/oral.pptx',
      }],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Template / Guidance')
    expect(wrapper.text()).toContain('Oral Template')
    expect(wrapper.text()).toContain('Download')
  })

  it('shows upload button when no submission exists', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Upload Presentation')
  })

  it('shows replace and delete buttons when submission exists', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: {
        url: '/uploads/presentation.pptx',
      },
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    expect(wrapper.text()).toContain('Replace')
    expect(wrapper.text()).toContain('Delete')
  })

  it('sets correct file accept attribute for oral presentations', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.attributes('accept')).toBe('.pptx,.ppt,.pdf')
  })

  it('sets correct file accept attribute for poster presentations', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Poster',
      event_name: 'Test Event',
      presentation_type: 'poster',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.attributes('accept')).toBe('.pdf,image/*')
  })

  it('shows upload progress state', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    const vm = wrapper.vm
    vm.uploading = { 1: true }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Uploading…')
  })

  it('shows error message on upload failure', async () => {
    const mockItems = [{
      abstract_id: 1,
      title: 'Test Presentation',
      event_name: 'Test Event',
      presentation_type: 'oral',
      templates: [],
      submission: null,
    }]

    api.get.mockResolvedValue({ data: mockItems })

    wrapper = mount(MyAbstractPresentationView)
    await flushPromises()

    const vm = wrapper.vm
    vm.errors = { 1: 'Upload failed' }
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Upload failed')
  })
})
