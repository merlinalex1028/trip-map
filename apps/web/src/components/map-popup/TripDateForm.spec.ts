import { mount } from '@vue/test-utils'

import TripDateForm from './TripDateForm.vue'

describe('TripDateForm', () => {
  it('keeps the save button disabled before a start date is selected', () => {
    const wrapper = mount(TripDateForm)

    expect(wrapper.get('[data-trip-date-submit]').attributes('disabled')).toBeDefined()
  })

  it('enables the save button after selecting a start date', async () => {
    const wrapper = mount(TripDateForm)

    await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-01')

    expect(wrapper.get('[data-trip-date-submit]').attributes('disabled')).toBeUndefined()
  })

  it('shows a range error and disables save when endDate is earlier than startDate', async () => {
    const wrapper = mount(TripDateForm)

    await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-07')
    await wrapper.get('[data-trip-date-input="end"]').setValue('2025-10-01')

    expect(wrapper.get('[data-trip-date-error="range"]').text()).toContain('结束日期不能早于开始日期')
    expect(wrapper.get('[data-trip-date-submit]').attributes('disabled')).toBeDefined()
  })

  it('emits submit when startDate and endDate are the same day', async () => {
    const wrapper = mount(TripDateForm)

    await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-05')
    await wrapper.get('[data-trip-date-input="end"]').setValue('2025-10-05')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      startDate: '2025-10-05',
      endDate: '2025-10-05',
    })
  })

  it('normalizes an empty endDate to null on submit', async () => {
    const wrapper = mount(TripDateForm)

    await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-05')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      startDate: '2025-10-05',
      endDate: null,
    })
  })

  it('emits cancel when the cancel button is clicked', async () => {
    const wrapper = mount(TripDateForm)

    await wrapper.get('[data-trip-date-cancel]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('does not emit submit while submitting', async () => {
    const wrapper = mount(TripDateForm, {
      props: {
        isSubmitting: true,
      },
    })

    await wrapper.get('[data-trip-date-input="start"]').setValue('2025-10-01')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeFalsy()
  })
})
