import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import RepoCard from './RepoCard.vue'
import type { Contributor, GitHubRepo } from '@/types/github'

function createMockRepo(overrides: Partial<GitHubRepo> = {}): GitHubRepo {
  return {
    id: 1,
    name: 'test-repo',
    full_name: 'my-org/test-repo',
    description: 'A test repository',
    homepage: 'https://example.com',
    forks_count: 5,
    watchers_count: 10,
    subscribers_count: 3,
    open_issues_count: 2,
    language: 'TypeScript',
    updated_at: '2026-06-06T12:00:00.000Z',
    license: { name: 'MIT' },
    ...overrides,
  }
}

function mountRepoCard(
  props: Partial<{
    repo: GitHubRepo
    expanded: boolean
    contributors: Contributor[]
    contributorsLoading: boolean
  }> = {},
) {
  return mount(RepoCard, {
    props: {
      repo: createMockRepo(),
      expanded: false,
      contributorsLoading: false,
      ...props,
    },
  })
}

describe('RepoCard', () => {
  it('displays repository metadata in collapsed state', () => {
    const wrapper = mountRepoCard()

    expect(wrapper.text()).toContain('my-org/test-repo')
    expect(wrapper.text()).toContain('A test repository')
    expect(wrapper.text()).toContain('TypeScript')
    expect(wrapper.text()).toContain('5 forks')
    expect(wrapper.text()).toContain('10 watchers')
    expect(wrapper.text()).toContain('MIT')
    expect(wrapper.find('time[datetime="2026-06-06T12:00:00.000Z"]').exists()).toBe(true)
  })

  it('shows placeholder when description and license are missing', () => {
    const wrapper = mountRepoCard({
      repo: createMockRepo({ description: null, license: null }),
    })

    expect(wrapper.text()).toContain('Aucune description')
    expect(wrapper.text()).toContain('Licence :')
    expect(wrapper.text()).toContain('—')
  })

  it('emits toggle when the title button is clicked', async () => {
    const wrapper = mountRepoCard()

    await wrapper.find('.repo-card__title').trigger('click')

    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })

  it('reflects expanded state on the title button', () => {
    const collapsed = mountRepoCard({ expanded: false })
    const expanded = mountRepoCard({ expanded: true })

    expect(collapsed.find('.repo-card__title').attributes('aria-expanded')).toBe('false')
    expect(expanded.find('.repo-card__title').attributes('aria-expanded')).toBe('true')
    expect(expanded.find('.repo-card').classes()).toContain('repo-card--expanded')
  })

  it('shows loading message for contributors when expanded', () => {
    const wrapper = mountRepoCard({ expanded: true, contributorsLoading: true })

    expect(wrapper.text()).toContain('Chargement des contributeurs…')
  })

  it('shows empty contributors message when list is empty', () => {
    const wrapper = mountRepoCard({
      expanded: true,
      contributors: [],
      contributorsLoading: false,
    })

    expect(wrapper.text()).toContain('Aucun contributeur')
  })

  it('renders contributors when expanded', () => {
    const contributors: Contributor[] = [
      {
        id: 1,
        login: 'alice',
        avatar_url: 'https://avatars.githubusercontent.com/u/1',
        html_url: 'https://github.com/alice',
        contributions: 1,
      },
      {
        id: 2,
        login: 'bob',
        avatar_url: 'https://avatars.githubusercontent.com/u/2',
        html_url: 'https://github.com/bob',
        contributions: 5,
      },
    ]

    const wrapper = mountRepoCard({
      expanded: true,
      contributors,
      contributorsLoading: false,
    })

    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('1 contribution')
    expect(wrapper.text()).toContain('bob')
    expect(wrapper.text()).toContain('5 contributions')
  })

  it('shows homepage link and detail counts when expanded', () => {
    const wrapper = mountRepoCard({ expanded: true })

    const homepageLink = wrapper.find('a.repo-card__link')
    expect(homepageLink.exists()).toBe(true)
    expect(homepageLink.attributes('href')).toBe('https://example.com')
    expect(wrapper.text()).toContain('3')
    expect(wrapper.text()).toContain('2')
  })

  it('shows em dash when homepage is absent', () => {
    const wrapper = mountRepoCard({
      expanded: true,
      repo: createMockRepo({ homepage: null }),
    })

    expect(wrapper.find('a.repo-card__link').exists()).toBe(false)
    expect(wrapper.text()).toContain('—')
  })
})
