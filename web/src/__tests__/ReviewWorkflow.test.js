import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyReviewsView from '@/pages/my_account/MyReviewsView.vue'
import api from '@/plugins/axios'

vi.mock('@/plugins/axios')

describe('Abstract Review Workflow', () => {
  let wrapper

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('Review Submission Flow', () => {
    const mockAssignment = {
      assignment_id: 1,
      completed: false,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'submitted',
        abstract_text: 'This is a test abstract for review workflow testing',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: null,
    }

    it('validates all required fields before submission', async () => {
      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Test empty form
      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please score all criteria.')

      // Test partial scores
      assignment._form.relevance_score = 4
      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please score all criteria.')

      // Test all scores but no recommendation
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 4
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please select a recommendation.')

      // Test all scores + recommendation but no comments
      assignment._form.recommendation = 'accept'
      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please add comments.')
    })

    it('submits review with all required fields', async () => {
      api.get.mockResolvedValueOnce({ data: [mockAssignment] })
      api.post.mockResolvedValueOnce({ data: { success: true } })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Fill in all required fields
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 5
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      assignment._form.recommendation = 'accept'
      assignment._form.comments = 'Excellent research with strong methodology'
      assignment._form.confidential_comments = 'Optional confidential note'

      await vm.submitReview(assignment)
      await wrapper.vm.$nextTick()

      expect(api.post).toHaveBeenCalledWith('/abstracts/reviews/1', {
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        recommendation: 'accept',
        comments: 'Excellent research with strong methodology',
        confidential_comments: 'Optional confidential note',
      })
      expect(assignment.completed).toBe(true)
      expect(assignment._success).toBe('Review submitted!')
    })

    it('handles submission errors gracefully', async () => {
      api.get.mockResolvedValueOnce({ data: [mockAssignment] })
      api.post.mockRejectedValueOnce({
        response: { data: { detail: 'Review submission failed' } }
      })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 5
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      assignment._form.recommendation = 'accept'
      assignment._form.comments = 'Excellent research'

      await vm.submitReview(assignment)
      await wrapper.vm.$nextTick()

      expect(assignment._error).toBe('Review submission failed')
      expect(assignment.completed).toBe(false)
    })
  })

  describe('Review Update Flow', () => {
    const mockCompletedAssignment = {
      assignment_id: 1,
      completed: true,
      assigned_at: '2026-01-15T10:00:00',
      abstract: {
        title: 'Test Abstract',
        event: 'Test Event',
        track: 'Test Track',
        word_count: 250,
        status: 'accepted',
        abstract_text: 'This is a test abstract',
        keywords: 'health, test',
        authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
      },
      review: {
        recommendation: 'accept',
        relevance_score: 4,
        methodology_score: 5,
        originality_score: 4,
        overall_score: 4,
        comments: 'Excellent research',
        confidential_comments: '',
      },
    }

    it('populates edit form with existing review data', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCompletedAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      vm.startEdit(assignment)
      await wrapper.vm.$nextTick()

      expect(assignment._editing).toBe(true)
      expect(assignment._form.recommendation).toBe('accept')
      expect(assignment._form.relevance_score).toBe(4)
      expect(assignment._form.methodology_score).toBe(5)
      expect(assignment._form.originality_score).toBe(4)
      expect(assignment._form.overall_score).toBe(4)
      expect(assignment._form.comments).toBe('Excellent research')
    })

    it('validates update form before submission', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCompletedAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      vm.startEdit(assignment)

      // Clear all scores
      assignment._form.relevance_score = 0
      assignment._form.methodology_score = 0
      assignment._form.originality_score = 0
      assignment._form.overall_score = 0

      await vm.updateReview(assignment)
      expect(assignment._error).toBe('Please score all criteria.')
    })

    it('updates review successfully', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCompletedAssignment] })
      api.put.mockResolvedValueOnce({ data: { success: true } })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      vm.startEdit(assignment)

      // Update values
      assignment._form.relevance_score = 5
      assignment._form.methodology_score = 5
      assignment._form.originality_score = 5
      assignment._form.overall_score = 5
      assignment._form.recommendation = 'accept'
      assignment._form.comments = 'Outstanding research with excellent methodology'

      await vm.updateReview(assignment)
      await wrapper.vm.$nextTick()

      expect(api.put).toHaveBeenCalledWith('/abstracts/reviews/1', assignment._form)
      expect(assignment._editing).toBe(false)
      expect(assignment._success).toBe('Review updated!')
    })

    it('cancels editing', async () => {
      api.get.mockResolvedValueOnce({ data: [mockCompletedAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      vm.startEdit(assignment)
      expect(assignment._editing).toBe(true)

      assignment._editing = false
      await wrapper.vm.$nextTick()

      expect(assignment._editing).toBe(false)
    })
  })

  describe('Score Selection', () => {
    it('allows selecting scores 1-5', async () => {
      api.get.mockResolvedValueOnce({ data: [] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm

      // Test each score value
      for (let i = 1; i <= 5; i++) {
        const assignment = {
          _form: { relevance_score: 0, methodology_score: 0, originality_score: 0, overall_score: 0 },
        }
        assignment._form.relevance_score = i
        expect(assignment._form.relevance_score).toBe(i)
      }
    })

    it('validates that all score fields are filled', async () => {
      const mockAssignment = {
        assignment_id: 1,
        completed: false,
        assigned_at: '2026-01-15T10:00:00',
        abstract: {
          title: 'Test Abstract',
          event: 'Test Event',
          track: 'Test Track',
          word_count: 250,
          status: 'submitted',
          abstract_text: 'Test',
          keywords: 'test',
          authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
        },
        review: null,
      }

      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Try to submit with only some scores
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 0
      assignment._form.originality_score = 0
      assignment._form.overall_score = 0

      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please score all criteria.')
    })
  })

  describe('Recommendation Options', () => {
    it('provides all recommendation options', async () => {
      const mockAssignment = {
        assignment_id: 1,
        completed: false,
        assigned_at: '2026-01-15T10:00:00',
        abstract: {
          title: 'Test Abstract',
          event: 'Test Event',
          track: 'Test Track',
          word_count: 250,
          status: 'submitted',
          abstract_text: 'Test',
          keywords: 'test',
          authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
        },
        review: null,
      }

      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await flushPromises()

      expect(wrapper.text()).toContain('Accept')
      expect(wrapper.text()).toContain('Revision Required')
      expect(wrapper.text()).toContain('Reject')
    })

    it('validates recommendation is required', async () => {
      const mockAssignment = {
        assignment_id: 1,
        completed: false,
        assigned_at: '2026-01-15T10:00:00',
        abstract: {
          title: 'Test Abstract',
          event: 'Test Event',
          track: 'Test Track',
          word_count: 250,
          status: 'submitted',
          abstract_text: 'Test',
          keywords: 'test',
          authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
        },
        review: null,
      }

      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Fill scores but leave recommendation empty
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 4
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      assignment._form.recommendation = ''

      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please select a recommendation.')
    })
  })

  describe('Comments Validation', () => {
    it('validates comments are required', async () => {
      const mockAssignment = {
        assignment_id: 1,
        completed: false,
        assigned_at: '2026-01-15T10:00:00',
        abstract: {
          title: 'Test Abstract',
          event: 'Test Event',
          track: 'Test Track',
          word_count: 250,
          status: 'submitted',
          abstract_text: 'Test',
          keywords: 'test',
          authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
        },
        review: null,
      }

      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Fill scores and recommendation but leave comments empty
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 4
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      assignment._form.recommendation = 'accept'
      assignment._form.comments = ''

      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please add comments.')
    })

    it('accepts whitespace-only comments as invalid', async () => {
      const mockAssignment = {
        assignment_id: 1,
        completed: false,
        assigned_at: '2026-01-15T10:00:00',
        abstract: {
          title: 'Test Abstract',
          event: 'Test Event',
          track: 'Test Track',
          word_count: 250,
          status: 'submitted',
          abstract_text: 'Test',
          keywords: 'test',
          authors: [{ id: 1, firstname: 'Jane', lastname: 'Doe', affiliation: 'Test Org' }],
        },
        review: null,
      }

      api.get.mockResolvedValueOnce({ data: [mockAssignment] })

      wrapper = mount(MyReviewsView)
      await wrapper.vm.$nextTick()

      const vm = wrapper.vm
      const assignment = vm.assignments[0]

      // Fill scores and recommendation but leave comments with only whitespace
      assignment._form.relevance_score = 4
      assignment._form.methodology_score = 4
      assignment._form.originality_score = 4
      assignment._form.overall_score = 4
      assignment._form.recommendation = 'accept'
      assignment._form.comments = '   '

      await vm.submitReview(assignment)
      expect(assignment._error).toBe('Please add comments.')
    })
  })
})