import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import type { ExerciseInstance } from '@/types/domain'

import ExerciseRenderer from './ExerciseRenderer.vue'

const base: ExerciseInstance = {
  id: 'exercise',
  templateId: 'template',
  seed: 'seed',
  topicId: 'topic',
  skillIds: ['skill'],
  difficulty: 1,
  kind: 'multipleChoice',
  prompt: 'Оберіть відповіді',
  expectedAnswer: '2, 5',
  choices: ['2', '3', '5'],
  hints: [],
  solutionSteps: [],
}

describe('ExerciseRenderer', () => {
  it('preserves multiple-choice selection order', async () => {
    const wrapper = mount(ExerciseRenderer, {
      props: { exercise: base, modelValue: [] },
    })
    await wrapper.get('button:nth-child(3)').trigger('click')
    await wrapper.setProps({ modelValue: ['5'] })
    await wrapper.get('button:nth-child(1)').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['5', '2'])
  })

  it('keeps the next step locked until the current rational answer is correct', async () => {
    const exercise: ExerciseInstance = {
      ...base,
      kind: 'stepByStep',
      choices: undefined,
      answerSpec: {
        kind: 'stepByStep',
        steps: [{ value: '1/2' }, { value: '3/4' }],
      },
      stepDefinitions: [
        { id: 'one', prompt: 'Перший крок', expectedAnswer: '1/2' },
        { id: 'two', prompt: 'Другий крок', expectedAnswer: '3/4' },
      ],
    }
    const wrapper = mount(ExerciseRenderer, {
      props: { exercise, modelValue: ['', ''] },
    })
    expect(wrapper.findAll('input')[1]?.attributes('disabled')).toBeDefined()
    await wrapper.setProps({ modelValue: ['2/4', ''] })
    expect(wrapper.findAll('input')[1]?.attributes('disabled')).toBeUndefined()
  })

  it('updates matching pairs through native keyboard-accessible selects', async () => {
    const exercise: ExerciseInstance = {
      ...base,
      kind: 'matching',
      choices: undefined,
      matchingPairs: [
        { left: '1/2', right: '2/4' },
        { left: '2/3', right: '4/6' },
      ],
      answerSpec: { kind: 'matching', pairs: { '1/2': '2/4', '2/3': '4/6' } },
    }
    const wrapper = mount(ExerciseRenderer, {
      props: { exercise, modelValue: {} },
    })
    await wrapper.get('select').setValue('2/4')
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual({ '1/2': '2/4' })
  })
})
