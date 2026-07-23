import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyAbstractsView from '@/pages/my_account/MyAbstractsView.vue'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios')

describe('MyAbstractsView', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('My Abstract Submissions')
  })

  it('shows loading state initially', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    wrapper = mount(MyAbstractsView)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows empty state when no abstracts', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('No abstracts submitted yet.')
  })

  it('displays abstract cards when abstracts exist', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'submitted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Test Abstract')
    expect(wrapper.text()).toContain('Test Event')
    expect(wrapper.text()).toContain('Test Track')
  })

  it('displays author information', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'submitted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('Presenting')
    expect(wrapper.text()).toContain('Test Org')
  })

  it('toggles abstract text expansion', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'submitted',
      created_at: '2026-01-15T10:00:00',
      abstract_text: 'This is the abstract content',
      keywords: 'health, test',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Show abstract')

    const showBtn = wrapper.findAll('button').find(b => b.text().includes('Show abstract'))
    await showBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('This is the abstract content')
    expect(wrapper.text()).toContain('Keywords:')
    expect(wrapper.text()).toContain('health, test')
    expect(wrapper.text()).toContain('Hide abstract')
  })

  it('applies correct status class for submitted status', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'submitted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    const statusBadge = wrapper.find('.bg-blue-100')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toContain('submitted')
  })

  it('applies correct status class for accepted status', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'accepted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    const statusBadge = wrapper.find('.bg-green-100')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toContain('accepted')
  })

  it('displays reviewer feedback for accepted abstracts', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'accepted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
      reviewer_assignments: [{
        id: 1,
        review: {
          recommendation: 'accept',
          relevance_score: 4,
          methodology_score: 5,
          originality_score: 4,
          overall_score: 4,
          comments: 'Excellent work',
        },
      }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Reviewer Feedback')
    expect(wrapper.text()).toContain('accept')
    expect(wrapper.text()).toContain('Excellent work')
    expect(wrapper.text()).toContain('Relevance: 4/5')
  })

  it('displays presentation templates for accepted abstracts', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'accepted',
      event_id: 1,
      presentation_type: 'oral',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    const mockTemplates = [{
      id: 1,
      name: 'Oral Template',
      url: '/templates/oral.pptx',
      event_id: 1,
      presentation_type: 'oral',
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: mockTemplates })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Presentation Templates')
    expect(wrapper.text()).toContain('Oral Template')
  })

  it('formats dates correctly', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      event: 'Test Event',
      track: 'Test Track',
      word_count: 250,
      status: 'submitted',
      created_at: '2026-01-15T10:00:00',
      authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', is_presenting: true, affiliation: 'Test Org' }],
    }]

    api.get.mockResolvedValueOnce({ data: mockAbstracts })
    api.get.mockResolvedValueOnce({ data: [] })

    wrapper = mount(MyAbstractsView)
    await flushPromises()

    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('Jan')
    expect(wrapper.text()).toContain('2026')
  })
})
