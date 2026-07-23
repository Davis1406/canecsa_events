import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios')

describe('AbstractSubmissionView', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-01T12:00:00'))
    setActivePinia(createPinia())
    api.get.mockImplementation((url) => {
      if (url.includes('/events/')) {
        return Promise.resolve({ data: { data: [{ id: 1 }] } })
      }
      if (url.includes('/abstracts/tracks/public')) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes('/abstracts/submission-status/')) {
        return Promise.resolve({ data: { abstract_submissions_open: true, deadline: '2026-06-15T23:59:59' } })
      }
      return Promise.resolve({ data: [] })
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mountSubmission = async () => {
    const { default: AbstractSubmissionView } = await import('@/pages/public/AbstractSubmissionView.vue')
    wrapper = mount(AbstractSubmissionView)
    await flushPromises()
    return wrapper
  }

  it('renders the page title', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Abstract Submission Guidelines')
  })

  it('displays the CANECSA 2026 badge', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('CANECSA 2026')
  })

  it('shows the main theme banner', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Along the Patient Pathway')
  })

  it('displays call for abstract guidelines', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Call For Abstract')
    expect(wrapper.text()).toContain('All abstracts must be written in English')
  })

  it('shows scientific tracks section', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Abstract Submission Sub-Themes')
  })

  it('displays the submission form when not closed', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Submit Your Abstract')
  })

  it('shows the submission form fields', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.find('input[placeholder="Title of your abstract"]').exists()).toBe(true)
    expect(wrapper.find('textarea[placeholder*="Write or paste your abstract"]').exists()).toBe(true)
  })

  it('displays the event selection dropdown', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Event')
  })

  it('displays the track selection dropdown', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Sub-Theme')
  })

  it('shows presentation preference options', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Oral Presentation')
    expect(wrapper.text()).toContain('ePoster Session')
    expect(wrapper.text()).toContain('Either')
  })

  it('displays the word count indicator', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('0 / 300 words')
  })

  it('shows the authors section', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Authors & Co-Authors')
  })

  it('has an add co-author button', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Add Co-Author')
  })

  it('shows the submit button', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Submit Abstract')
  })

  it('displays the deadline information', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('June 2026')
  })

  it('shows the contact email', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('info@canecsa.org')
  })

  it('displays the review process information', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Review Process')
    expect(wrapper.text()).toContain('Oral presentation')
    expect(wrapper.text()).toContain('Poster presentation')
    expect(wrapper.text()).toContain('Rejection')
  })

  it('shows session presentations info', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Session Presentations')
    expect(wrapper.text()).toContain('10 minutes')
  })

  it('shows ePoster sessions info', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('ePoster Sessions')
  })

  it('displays the withdrawing abstract warning', async () => {
    wrapper = await mountSubmission()
    expect(wrapper.text()).toContain('Withdrawing an Abstract')
  })

  it('initializes the form with default values', async () => {
    wrapper = await mountSubmission()
    const vm = wrapper.vm
    expect(vm.form.event_id).toBeNull()
    expect(vm.form.title).toBe('')
    expect(vm.form.track_id).toBeNull()
    expect(vm.form.presentation_type).toBe('either')
    expect(vm.form.abstract_text).toBe('')
    expect(vm.form.keywords).toBe('')
    expect(vm.form.authors).toHaveLength(1)
    expect(vm.form.authors[0].is_presenting).toBe(true)
  })

  it('calculates word count correctly', async () => {
    wrapper = await mountSubmission()
    const vm = wrapper.vm
    vm.form.abstract_text = 'This is a test abstract with five words'
    await wrapper.vm.$nextTick()
    expect(vm.wordCount).toBe(8)
  })

  it('adds a new author when addAuthor is called', async () => {
    wrapper = await mountSubmission()
    const vm = wrapper.vm
    expect(vm.form.authors).toHaveLength(1)
    vm.addAuthor()
    await wrapper.vm.$nextTick()
    expect(vm.form.authors).toHaveLength(2)
    expect(vm.form.authors[1].is_presenting).toBe(false)
  })

  it('removes an author when removeAuthor is called', async () => {
    wrapper = await mountSubmission()
    const vm = wrapper.vm
    vm.addAuthor()
    expect(vm.form.authors).toHaveLength(2)
    vm.removeAuthor(1)
    await wrapper.vm.$nextTick()
    expect(vm.form.authors).toHaveLength(1)
  })

  it('resets the form after successful submission', async () => {
    api.post.mockResolvedValueOnce({ data: {} })

    wrapper = await mountSubmission()
    const vm = wrapper.vm
    vm.form.event_id = 1
    vm.form.title = 'Test Abstract'
    vm.form.abstract_text = 'Test content'
    vm.form.authors = [{ firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com', affiliation: 'Test Org', country: 'Test', is_presenting: true }]

    await vm.submitAbstract()
    await wrapper.vm.$nextTick()

    expect(vm.submitted).toBe(true)
    expect(vm.form.event_id).toBeNull()
    expect(vm.form.title).toBe('')
  })

  it('displays error message on submission failure', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { detail: 'Submission failed' } }
    })

    wrapper = await mountSubmission()
    const vm = wrapper.vm
    vm.form.event_id = 1
    vm.form.title = 'Test Abstract'
    vm.form.abstract_text = 'Test content'
    vm.form.authors = [{ firstname: 'Jane', lastname: 'Doe', email: '', affiliation: '', country: '', is_presenting: true }]

    await vm.submitAbstract()
    await wrapper.vm.$nextTick()

    expect(vm.submitError).toBe('Submission failed')
  })

  it('disables submit button when word count exceeds 300', async () => {
    wrapper = await mountSubmission()
    const vm = wrapper.vm
    vm.form.abstract_text = 'word '.repeat(301)
    await wrapper.vm.$nextTick()
    expect(vm.wordCount).toBeGreaterThan(300)
    const submitBtn = wrapper.find('button[type="submit"]')
    expect(submitBtn.attributes('disabled')).toBeDefined()
  })

  it('fetches events and tracks on mount', async () => {
    wrapper = await mountSubmission()

    expect(api.get).toHaveBeenCalledWith('/events/?skip=0&limit=200')
    expect(api.get).toHaveBeenCalledWith('/abstracts/tracks/public')
  })

  it('shows closed state when deadline has passed', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/events/')) {
        return Promise.resolve({ data: { data: [{ id: 1 }] } })
      }
      if (url.includes('/abstracts/tracks/public')) {
        return Promise.resolve({ data: [] })
      }
      if (url.includes('/abstracts/submission-status/')) {
        return Promise.resolve({ data: { abstract_submissions_open: false, deadline: '2025-01-01T23:59:59' } })
      }
      return Promise.resolve({ data: [] })
    })
    vi.resetModules()

    const { default: AbstractSubmissionView } = await import('@/pages/public/AbstractSubmissionView.vue')
    wrapper = mount(AbstractSubmissionView)
    await flushPromises()

    expect(wrapper.text()).toContain('DEADLINE PASSED')
    expect(wrapper.text()).toContain('Abstract Submissions Closed')
  })
})
