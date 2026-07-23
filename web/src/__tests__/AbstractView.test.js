import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AbstractView from '@/pages/admin/abstracts/AbstractView.vue'
import api from '@/plugins/axios'
import { useRoute, useRouter } from 'vue-router'

vi.mock('@/plugins/axios')
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { id: '1' },
    query: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}))

describe('AbstractView (Admin Detail)', () => {
  let wrapper
  const mockPush = vi.fn()
  const mockBack = vi.fn()

  const mockAbstract = {
    id: 1,
    title: 'Test Abstract',
    status: 'submitted',
    presentation_type: 'oral',
    track_code: 'T1',
    track_title: 'Track 1',
    track_theme: 'Health Systems',
    event_id: 1,
    event: 'Test Event',
    word_count: 250,
    submitter_name: 'Jane Doe',
    created_at: '2026-01-15T10:00:00',
    abstract_text: 'This is the abstract content',
    keywords: 'health, test',
    authors: [{
      id: 1,
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
      affiliation: 'Test Org',
      country: 'Tanzania',
      is_presenting: true,
    }],
    reviewer_assignments: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, back: mockBack })
    api.get.mockImplementation((url) => {
      if (url.includes('/abstracts/reviewers/candidates')) {
        return Promise.resolve({ data: [] })
      }
      return Promise.resolve({ data: mockAbstract })
    })
  })

  const mountComponent = async (abstractData) => {
    if (abstractData) {
      api.get.mockImplementation((url) => {
        if (url.includes('/abstracts/reviewers/candidates')) {
          return Promise.resolve({ data: [] })
        }
        return Promise.resolve({ data: abstractData })
      })
    }
    wrapper = mount(AbstractView, {
      global: {
        stubs: {
          teleport: true,
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  it('renders the abstract title', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Test Abstract')
  })

  it('shows loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {}))

    wrapper = mount(AbstractView, {
      global: {
        stubs: { teleport: true },
      },
    })
    expect(wrapper.text()).toContain('Loading...')
  })

  it('displays the abstract status', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('submitted')
  })

  it('displays the abstract metadata', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Test Event')
    expect(wrapper.text()).toContain('T1')
    expect(wrapper.text()).toContain('Track 1')
    expect(wrapper.text()).toContain('Health Systems')
    expect(wrapper.text()).toContain('oral')
    expect(wrapper.text()).toContain('250')
    expect(wrapper.text()).toContain('Jane Doe')
  })

  it('displays the authors table', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Authors & Co-Authors')
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('jane@example.com')
    expect(wrapper.text()).toContain('Test Org')
    expect(wrapper.text()).toContain('Tanzania')
    expect(wrapper.text()).toContain('Yes')
  })

  it('displays the abstract text', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('This is the abstract content')
    expect(wrapper.text()).toContain('Keywords:')
    expect(wrapper.text()).toContain('health, test')
  })

  it('shows the status update panel', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Update Status')
    expect(wrapper.text()).toContain('Save Status')
  })

  it('shows the reviewers panel', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Reviewers')
    expect(wrapper.text()).toContain('No reviewers assigned yet.')
  })

  it('displays assigned reviewers', async () => {
    const abstractWithReviewers = {
      ...mockAbstract,
      reviewer_assignments: [{
        id: 1,
        reviewer_id: 10,
        reviewer_name: 'Dr. Smith',
        reviewer_email: 'smith@example.com',
        completed: false,
      }],
    }

    await mountComponent(abstractWithReviewers)

    expect(wrapper.text()).toContain('Dr. Smith')
    expect(wrapper.text()).toContain('smith@example.com')
    expect(wrapper.text()).toContain('Pending')
  })

  it('shows completed review status', async () => {
    const abstractWithCompletedReview = {
      ...mockAbstract,
      reviewer_assignments: [{
        id: 1,
        reviewer_id: 10,
        reviewer_name: 'Dr. Smith',
        reviewer_email: 'smith@example.com',
        completed: true,
        review: {
          recommendation: 'accept',
          relevance_score: 4,
          methodology_score: 5,
          originality_score: 4,
          overall_score: 4,
          comments: 'Excellent work',
        },
      }],
    }

    await mountComponent(abstractWithCompletedReview)

    expect(wrapper.text()).toContain('Reviewed')
  })

  it('displays completed reviews section', async () => {
    const abstractWithCompletedReview = {
      ...mockAbstract,
      reviewer_assignments: [{
        id: 1,
        reviewer_id: 10,
        reviewer_name: 'Dr. Smith',
        reviewer_email: 'smith@example.com',
        completed: true,
        review: {
          recommendation: 'accept',
          relevance_score: 4,
          methodology_score: 5,
          originality_score: 4,
          overall_score: 4,
          comments: 'Excellent work',
        },
      }],
    }

    await mountComponent(abstractWithCompletedReview)

    expect(wrapper.text()).toContain('Reviews')
    expect(wrapper.text()).toContain('Dr. Smith')
    expect(wrapper.text()).toContain('Relevance')
    expect(wrapper.text()).toContain('4/5')
    expect(wrapper.text()).toContain('Methodology')
    expect(wrapper.text()).toContain('5/5')
    expect(wrapper.text()).toContain('Originality')
    expect(wrapper.text()).toContain('Overall')
    expect(wrapper.text()).toContain('Excellent work')
  })

  it('shows edit button', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Edit')
  })

  it('shows delete button', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Delete')
  })

  it('opens edit modal', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    await wrapper.vm.$nextTick()

    expect(vm.editModal.open).toBe(true)
    expect(wrapper.text()).toContain('Edit Abstract')
    expect(wrapper.text()).toContain('Save Changes')
  })

  it('validates edit form - requires title', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    vm.editForm.title = ''
    vm.editForm.abstract_text = 'Test content'

    await vm.saveEdit()

    expect(vm.editModal.error).toBe('Title and abstract body are required.')
  })

  it('validates edit form - requires abstract text', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    vm.editForm.title = 'Test Title'
    vm.editForm.abstract_text = ''

    await vm.saveEdit()

    expect(vm.editModal.error).toBe('Title and abstract body are required.')
  })

  it('validates edit form - word count limit', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    vm.editForm.title = 'Test Title'
    vm.editForm.abstract_text = 'word '.repeat(301)

    await vm.saveEdit()

    expect(vm.editModal.error).toBe('Abstract is over 300 words. Please shorten it.')
  })

  it('adds author in edit modal', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    const initialLength = vm.editForm.authors.length

    vm.addEditAuthor()
    await wrapper.vm.$nextTick()

    expect(vm.editForm.authors.length).toBe(initialLength + 1)
  })

  it('removes author in edit modal', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.openEdit()
    vm.addEditAuthor()
    const lengthAfterAdd = vm.editForm.authors.length

    vm.editForm.authors.splice(1, 1)
    await wrapper.vm.$nextTick()

    expect(vm.editForm.authors.length).toBe(lengthAfterAdd - 1)
  })

  it('shows reviewer assignment dropdown', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Add Reviewer')
    expect(wrapper.text()).toContain('Select a reviewer')
  })

  it('assigns reviewer successfully', async () => {
    const abstractWithReviewer = {
      ...mockAbstract,
      reviewer_assignments: [{
        id: 1,
        reviewer_id: 10,
        reviewer_name: 'Dr. Smith',
        reviewer_email: 'smith@example.com',
        completed: false,
      }],
    }

    await mountComponent(abstractWithReviewer)
    api.post.mockResolvedValueOnce({ data: { success: true } })

    const vm = wrapper.vm
    vm.selectedReviewer = { id: 10, firstname: 'Dr.', lastname: 'Smith', email: 'smith@example.com' }

    await vm.assignReviewer()
    await flushPromises()

    expect(api.post).toHaveBeenCalledWith('/abstracts/1/assign-reviewer', { reviewer_id: 10 })
    expect(vm.assignMsg).toContain('assigned')
  })

  it('shows remove button for assigned reviewers', async () => {
    const abstractWithReviewer = {
      ...mockAbstract,
      reviewer_assignments: [{
        id: 1,
        reviewer_id: 10,
        reviewer_name: 'Dr. Smith',
        reviewer_email: 'smith@example.com',
        completed: false,
      }],
    }

    await mountComponent(abstractWithReviewer)

    expect(wrapper.text()).toContain('Remove')
  })

  it('formats dates correctly', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('15')
    expect(wrapper.text()).toContain('Jan')
    expect(wrapper.text()).toContain('2026')
  })

  it('navigates back to list via router.push', async () => {
    await mountComponent()

    const vm = wrapper.vm
    vm.goBackToList()

    expect(mockPush).toHaveBeenCalledWith({ name: 'AdminAbstracts' })
  })
})
