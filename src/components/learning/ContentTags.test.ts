import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ContentTags from './ContentTags.vue'

describe('ContentTags', () => {
  it('renders grade and subject tags with distinct styles', () => {
    const wrapper = mount(ContentTags, {
      props: {
        tags: ['Звичайні дроби', 'Візуальні моделі'],
        gradeLevels: [5, 6],
      },
    })

    expect(wrapper.get('[role="list"]').attributes('aria-label')).toBe('Теги навчального матеріалу')
    expect(wrapper.findAll('.content-tag--grade').map((tag) => tag.text())).toEqual([
      '5 клас',
      '6 клас',
    ])
    expect(wrapper.findAll('.content-tag--topic').map((tag) => tag.text())).toEqual([
      'Звичайні дроби',
      'Візуальні моделі',
    ])
  })

  it('does not render an empty tag list', () => {
    const wrapper = mount(ContentTags, {
      props: {
        tags: [],
        gradeLevels: [],
      },
    })

    expect(wrapper.find('.content-tags').exists()).toBe(false)
  })
})
