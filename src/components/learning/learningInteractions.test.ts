import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import FractionBar from './FractionBar.vue'
import GroupingBoard from './GroupingBoard.vue'
import PredictionChoice from './PredictionChoice.vue'
import TapReveal from './TapReveal.vue'

describe('interactive lesson blocks', () => {
  it('locks a prediction after one choice and explains the result', async () => {
    const wrapper = mount(PredictionChoice, {
      props: {
        question: 'Скільки буде 2 + 2?',
        choices: ['3', '4', '5'],
        correctChoiceIndex: 1,
      },
      slots: {
        explanation: ' Два і два утворюють чотири.',
      },
    })

    await wrapper.findAll('button')[0]?.trigger('click')
    expect(wrapper.emitted('update:selectedIndex')).toEqual([[0]])

    await wrapper.setProps({ selectedIndex: 0 })
    expect(wrapper.text()).toContain('Гарна гіпотеза.')
    expect(wrapper.text()).toContain('Два і два утворюють чотири.')
    expect(wrapper.findAll('button').every((button) => button.attributes('disabled') !== undefined)).toBe(
      true,
    )
  })

  it('completes a fraction only after selecting the target number of parts', async () => {
    const wrapper = mount(FractionBar, {
      props: {
        modelValue: [0, 1],
        parts: 6,
        target: 3,
      },
    })

    await wrapper.findAll('button')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[[0, 1, 2]]])
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('recognizes a completed grouping model', async () => {
    const wrapper = mount(GroupingBoard, {
      props: {
        modelValue: [4, 4, 3],
        groups: 3,
        perGroup: 4,
      },
    })

    await wrapper.findAll('button')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[[4, 4, 4]]])
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  it('finishes a topic preview after all cards are revealed', async () => {
    const wrapper = mount(TapReveal, {
      props: {
        modelValue: [0, 1],
        items: [
          { label: 'Ідея', content: 'Перша' },
          { label: 'Перевірка', content: 'Друга' },
          { label: 'Виклик', content: 'Третя' },
        ],
      },
    })

    await wrapper.findAll('button')[2]?.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[[0, 1, 2]]])
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })
})
