import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AbstractsView from '@/pages/admin/abstracts/AbstractsView.vue'
import api from '@/plugins/axios'
import { useRoute, useRouter } from 'vue-router'

vi.mock('@/plugins/axios')
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: {},
    query: {},
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  })),
  createRouter: vi.fn(),
  createWebHistory: vi.fn(),
}))

describe('AbstractsView (Admin)', () => {
  let wrapper
  const mockPush = vi.fn()
  const mockReplace = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
    vi.mocked(useRouter).mockReturnValue({ push: mockPush, back: vi.fn(), replace: mockReplace })
  })

  const mountComponent = async (apiResponses = {}) => {
    const defaults = {
      events: { data: { data: [], skip: 0, limit: 200 } },
      tracks: { data: [] },
      abstracts: { data: { data: [], total: 0 } },
      reviewers: { data: [] },
    }
    const responses = { ...defaults, ...apiResponses }

    api.get.mockImplementation((url) => {
      if (url.includes('/events/')) return Promise.resolve(responses.events)
      if (url.includes('/abstracts/tracks/list')) return Promise.resolve(responses.tracks)
      if (url.includes('/abstracts/reviewers/candidates')) return Promise.resolve(responses.reviewers)
      if (url.includes('/abstracts')) return Promise.resolve(responses.abstracts)
      return Promise.resolve({ data: [] })
    })

    wrapper = mount(AbstractsView, {
      global: {
        stubs: {
          AbstractStatsPanel: true,
        },
      },
    })
    await flushPromises()
    return wrapper
  }

  it('renders the page title', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Abstract Submissions')
  })

  it('shows loading state initially', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    wrapper = mount(AbstractsView, {
      global: {
        stubs: {
          AbstractStatsPanel: true,
        },
      },
    })
    expect(wrapper.text()).toContain('Loading abstracts...')
  })

  it('shows empty state when no abstracts', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('No abstracts found.')
  })

  it('displays abstract count', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('1 abstract')
  })

  it('displays abstract table rows', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('Test Abstract')
    expect(wrapper.text()).toContain('Jane Doe')
    expect(wrapper.text()).toContain('oral')
  })

  it('displays status badges with correct classes', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'accepted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const statusBadge = wrapper.find('.bg-green-100')
    expect(statusBadge.exists()).toBe(true)
    expect(statusBadge.text()).toContain('accepted')
  })

  it('displays track code badges', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('T1')
  })

  it('displays reviewer count', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [
        { id: 1, reviewer_name: 'Reviewer 1', reviewer_email: 'reviewer1@test.com', completed: false },
      ],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('1')
  })

  it('shows search input', async () => {
    await mountComponent()
    expect(wrapper.find('input[placeholder*="Search"]').exists()).toBe(true)
  })

  it('shows filter dropdowns', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('All Events')
    expect(wrapper.text()).toContain('All Statuses')
    expect(wrapper.text()).toContain('All Sub-Themes')
    expect(wrapper.text()).toContain('All Types')
  })

  it('shows export buttons', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Export')
    expect(wrapper.text()).toContain('to Excel')
    expect(wrapper.text()).toContain('Book of Abstracts PDF')
  })

  it('shows action buttons', async () => {
    await mountComponent()
    expect(wrapper.text()).toContain('Reports')
    expect(wrapper.text()).toContain('Templates')
    expect(wrapper.text()).toContain('All Presentations')
    expect(wrapper.text()).toContain('Notifications')
  })

  it('shows view and delete actions for each abstract', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('View')
    expect(wrapper.text()).toContain('Delete')
  })

  it('shows assign button for each abstract', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('Assign')
  })

  it('shows notify button for accepted abstracts', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'accepted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
      acceptance_notified_at: null,
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('Notify')
  })

  it('shows notified status when already notified', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'accepted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
      acceptance_notified_at: '2026-01-20T10:00:00',
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    expect(wrapper.text()).toContain('Notified')
  })

  it('shows select all checkbox', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const selectAllCheckbox = wrapper.find('th input[type="checkbox"]')
    expect(selectAllCheckbox.exists()).toBe(true)
  })

  it('shows row checkboxes', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const rowCheckbox = wrapper.find('td input[type="checkbox"]')
    expect(rowCheckbox.exists()).toBe(true)
  })

  it('toggles row selection', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const vm = wrapper.vm
    expect(vm.selectedIds.size).toBe(0)

    vm.toggleRow(mockAbstracts[0])
    await wrapper.vm.$nextTick()

    expect(vm.selectedIds.size).toBe(1)
    expect(vm.selectedIds.has(1)).toBe(true)
  })

  it('shows bulk action bar when items selected', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const vm = wrapper.vm
    vm.toggleRow(mockAbstracts[0])
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('1 abstract selected')
    expect(wrapper.text()).toContain('Assign Reviewers to Selected')
    expect(wrapper.text()).toContain('Change Status of Selected')
  })

  it('paginates abstracts', async () => {
    const mockAbstracts = Array.from({ length: 55 }, (_, i) => ({
      id: i + 1,
      title: `Abstract ${i + 1}`,
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }))

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 55 } },
    })

    const vm = wrapper.vm
    expect(vm.totalPages).toBe(2)
  })

  it('navigates between pages', async () => {
    const mockAbstracts = Array.from({ length: 55 }, (_, i) => ({
      id: i + 1,
      title: `Abstract ${i + 1}`,
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }))

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 55 } },
    })

    const vm = wrapper.vm
    expect(vm.page).toBe(1)

    vm.goToPage(2)
    await wrapper.vm.$nextTick()

    expect(vm.page).toBe(2)
  })

  it('opens notification dropdown', async () => {
    await mountComponent()
    const vm = wrapper.vm
    expect(vm.notifDropdownOpen).toBe(false)

    vm.notifDropdownOpen = true
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Notify Accepted Authors')
    expect(wrapper.text()).toContain('Registration Reminder')
    expect(wrapper.text()).toContain('Notify Rejected Authors')
  })

  it('opens quick assign modal', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      track_title: 'Track 1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const vm = wrapper.vm
    vm.openQuickAssign(mockAbstracts[0])
    await wrapper.vm.$nextTick()

    expect(vm.quickModal.open).toBe(true)
    expect(wrapper.text()).toContain('Assign Reviewer')
  })

  it('fetches events, tracks, and abstracts on mount', async () => {
    await mountComponent()

    expect(api.get).toHaveBeenCalledWith('/events/?skip=0&limit=200')
    expect(api.get).toHaveBeenCalledWith('/abstracts/tracks/list')
    expect(api.get).toHaveBeenCalledWith(
      expect.stringContaining('/abstracts/?')
    )
  })

  it('opens reports panel', async () => {
    await mountComponent()
    const vm = wrapper.vm

    vm.openReports()
    await wrapper.vm.$nextTick()

    expect(vm.reportsOpen).toBe(true)
    expect(wrapper.text()).toContain('Abstract Reports')
  })

  it('opens templates modal', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/events/templates')) return Promise.resolve({ data: [] })
      return Promise.resolve({ data: { data: [], total: 0 } })
    })

    await mountComponent()
    const vm = wrapper.vm

    vm.openTemplates()
    await wrapper.vm.$nextTick()

    expect(vm.tmplModal.open).toBe(true)
    expect(wrapper.text()).toContain('Presentation Templates')
  })

  it('opens bulk status change modal', async () => {
    const mockAbstracts = [{
      id: 1,
      title: 'Test Abstract',
      status: 'submitted',
      presentation_type: 'oral',
      track_code: 'T1',
      event_id: 1,
      authors: [{ firstname: 'Jane', lastname: 'Doe' }],
      reviewer_assignments: [],
    }]

    await mountComponent({
      abstracts: { data: { data: mockAbstracts, total: 1 } },
    })

    const vm = wrapper.vm
    vm.toggleRow(mockAbstracts[0])
    await wrapper.vm.$nextTick()

    vm.openBulkStatusModal()
    await wrapper.vm.$nextTick()

    expect(vm.bulkStatusModal.open).toBe(true)
    expect(wrapper.text()).toContain('Change Status of Selected Abstracts')
  })
})
