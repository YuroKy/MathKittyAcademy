import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import MathExpression from './MathExpression.vue'

describe('MathExpression', () => {
  it('renders bundled KaTeX with an accessible label', () => {
    const wrapper = mount(MathExpression, {
      props: {
        expression: '\\frac{1}{2}',
        label: 'Одна друга',
      },
    })

    expect(wrapper.attributes('aria-label')).toBe('Одна друга')
    expect(wrapper.find('.katex').exists()).toBe(true)
  })
})
