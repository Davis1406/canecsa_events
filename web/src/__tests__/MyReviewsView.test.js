import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyReviewsView from '@/pages/my_account/MyReviewsView.vue'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios')

describe('MyReviewsView', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  it('renders the page title', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('My Assigned Reviews')
  })

  it('shows loading state initially', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    wrapper = mount(MyReviewsView)
    expect(wrapper.text()).toContain('Loading...')
  })

  it('shows empty state when no assignments', async () => {
    api.get.mockResolvedValue({ data: [] })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('No abstracts assigned for review.')
  })

  it('displays assignment cards when assignments exist', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Test Abstract')
    expect(wrapper.text()).toContain('Test Event')
    expect(wrapper.text()).toContain('Test Track')
  })

  it('shows pending review status for incomplete reviews', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Pending Review')
  })

  it('shows completed review status for completed reviews', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: true,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'accepted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: {
        recommendation: 'accept',
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        comments: 'Excellent work',
      },
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Reviewed')
  })

  it('displays review form for incomplete reviews', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Submit Your Review')
    expect(wrapper.text()).toContain('Relevance')
    expect(wrapper.text()).toContain('Methodology')
    expect(wrapper.text()).toContain('Originality')
    expect(wrapper.text()).toContain('Overall Score')
  })

  it('displays submitted review in view mode', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: true,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'accepted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: {
        recommendation: 'accept',
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        comments: 'Excellent work',
      },
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Your Review')
    expect(wrapper.text()).toContain('Relevance')
    expect(wrapper.text()).toContain('4/5')
    expect(wrapper.text()).toContain('Methodology')
    expect(wrapper.text()).toContain('5/5')
    expect(wrapper.text()).toContain('Originality')
    expect(wrapper.text()).toContain('Overall')
    expect(wrapper.text()).toContain('Excellent work')
  })

  it('shows edit button for completed reviews', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: true,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'accepted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: {
        recommendation: 'accept',
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        comments: 'Excellent work',
      },
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Edit Review')
  })

  it('shows recommendation dropdown with options', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    expect(wrapper.text()).toContain('Accept')
    expect(wrapper.text()).toContain('Revision Required')
    expect(wrapper.text()).toContain('Reject')
  })

  it('validates review submission - requires all scores', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    const assignment = vm.assignments[0]

    await vm.submitReview(assignment)
    expect(assignment._error).toBe('Please score all criteria.')
  })

  it('validates review submission - requires recommendation', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    const assignment = vm.assignments[0]
    assignment._form.relevance_score = 4
    assignment._form.methodology_score = 4
    assignment._form.originality_score = 4
    assignment._form.overall_score = 4

    await vm.submitReview(assignment)
    expect(assignment._error).toBe('Please select a recommendation.')
  })

  it('validates review submission - requires comments', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    const assignment = vm.assignments[0]
    assignment._form.relevance_score = 4
    assignment._form.methodology_score = 4
    assignment._form.originality_score = 4
    assignment._form.overall_score = 4
    assignment._form.recommendation = 'accept'

    await vm.submitReview(assignment)
    expect(assignment._error).toBe('Please add comments.')
  })

  it('submits review successfully', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValueOnce({ data: mockAssignments })
    api.post.mockResolvedValueOnce({ data: { success: true } })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    const assignment = vm.assignments[0]
    assignment._form.relevance_score = 4
    assignment._form.methodology_score = 5
    assignment._form.originality_score = 4
    assignment._form.overall_score = 4
    assignment._form.recommendation = 'accept'
    assignment._form.comments = 'Excellent work'
    assignment._form.confidential_comments = ''

    await vm.submitReview(assignment)
    await wrapper.vm.$nextTick()

    expect(assignment.completed).toBe(true)
    expect(assignment._success).toBe('Review submitted!')
    expect(api.post).toHaveBeenCalledWith('/abstracts/reviews/1', assignment._form)
  })

  it('expands uncompleted reviews automatically', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    expect(vm.assignments[0]._expanded).toBe(true)
  })

  it('collapses completed reviews by default', async () => {
    const mockAssignments = [{
      assignment_id: 1,
      completed: true,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'accepted',
        abstract_text: 'Test abstract text',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: {
        recommendation: 'accept',
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        comments: 'Excellent work',
      },
    }]

    api.get.mockResolvedValue({ data: mockAssignments })

    wrapper = mount(MyReviewsView)
    await flushPromises()

    const vm = wrapper.vm
    expect(vm.assignments[0]._expanded).toBe(false)
  })
})
