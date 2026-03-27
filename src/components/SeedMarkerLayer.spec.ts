import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import seedMarkerLayerSource from './SeedMarkerLayer.vue?raw'
import SeedMarkerLayer from './SeedMarkerLayer.vue'

function createPoint(overrides: Record<string, unknown> = {}) {
  return {
    id: 'saved-japan',
    name: 'Japan',
    countryName: 'Japan',
    countryCode: 'JP',
    precision: 'country' as const,
    cityId: null,
    cityName: null,
    cityContextLabel: 'Japan',
    boundaryId: null,
    boundaryDatasetVersion: null,
    fallbackNotice: null,
    lat: 35,
    lng: 135,
    x: 0.7,
    y: 0.45,
    source: 'saved' as const,
    isFeatured: false,
    description: 'saved point',
    coordinatesLabel: '35.0000°N, 135.0000°E',
    ...overrides
  }
}

describe('SeedMarkerLayer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('builds complete aria-label semantics, including 未保存地点 for draft markers', () => {
    const wrapper = mount(SeedMarkerLayer, {
      props: {
        points: [
          createPoint(),
          createPoint({
            id: 'detected-kyoto',
            name: 'Kyoto',
            countryName: 'Japan',
            source: 'detected',
            coordinatesLabel: '35.0100°N, 135.7600°E'
          })
        ],
        selectedPointId: null
      }
    })

    const buttons = wrapper.findAll('.seed-marker__button')

    expect(buttons[0].attributes('aria-label')).toBe('Japan，Japan，35.0000°N, 135.0000°E')
    expect(buttons[1].attributes('aria-label')).toBe('Kyoto，Japan，35.0100°N, 135.7600°E，未保存地点')
  })

  it('applies selected-point-id hierarchy classes and dims non-selected markers', () => {
    const wrapper = mount(SeedMarkerLayer, {
      props: {
        points: [
          createPoint({ id: 'saved-japan' }),
          createPoint({ id: 'saved-egypt', name: 'Egypt', countryName: 'Egypt', x: 0.52, y: 0.34 })
        ],
        selectedPointId: 'saved-japan'
      }
    })

    const markers = wrapper.findAll('.seed-marker')
    const buttons = wrapper.findAll('.seed-marker__button')

    expect(markers[0].classes()).toContain('seed-marker--selected')
    expect(markers[1].classes()).toContain('seed-marker--dimmed')
    expect(buttons[0].classes()).toContain('seed-marker__button--selected')
  })

  it('exposes explicit marker semantic hooks for selected, draft, saved, and neutral states', () => {
    const wrapper = mount(SeedMarkerLayer, {
      props: {
        points: [
          createPoint({ id: 'saved-japan', source: 'saved' }),
          createPoint({ id: 'detected-kyoto', name: 'Kyoto', source: 'detected', x: 0.66, y: 0.48 }),
          createPoint({ id: 'seed-oslo', name: 'Oslo', source: 'seed', x: 0.44, y: 0.34 }),
          createPoint({ id: 'saved-lisbon', name: 'Lisbon', source: 'saved', x: 0.41, y: 0.39 })
        ],
        selectedPointId: 'saved-lisbon'
      }
    })

    expect(wrapper.get('[data-point-id="saved-japan"]').element.closest('.seed-marker')?.getAttribute('data-marker-state')).toBe(
      'saved'
    )
    expect(
      wrapper.get('[data-point-id="detected-kyoto"]').element.closest('.seed-marker')?.getAttribute('data-marker-state')
    ).toBe('draft')
    expect(wrapper.get('[data-point-id="seed-oslo"]').element.closest('.seed-marker')?.getAttribute('data-marker-state')).toBe(
      'neutral'
    )
    expect(wrapper.get('[data-point-id="saved-lisbon"]').element.closest('.seed-marker')?.getAttribute('data-marker-state')).toBe(
      'selected'
    )
  })

  it('reveals labels for focus-visible interactions without keeping all labels on screen', async () => {
    const wrapper = mount(SeedMarkerLayer, {
      props: {
        points: [
          createPoint({ id: 'saved-japan', name: 'Japan' }),
          createPoint({ id: 'saved-osaka', name: 'Osaka', x: 0.66, y: 0.48 }),
          createPoint({ id: 'seed-kyoto', name: 'Kyoto', isFeatured: true, x: 0.64, y: 0.46, source: 'seed' })
        ],
        selectedPointId: null
      }
    })

    expect(wrapper.text()).not.toContain('Osaka')
    expect(wrapper.text()).toContain('Kyoto')

    await wrapper.findAll('.seed-marker__button')[1].trigger('focus')

    expect(wrapper.text()).toContain('Osaka')

    await wrapper.findAll('.seed-marker__button')[1].trigger('blur')

    expect(wrapper.text()).not.toContain('Osaka')
  })

  it('keeps the marker hit target and reduced-motion pulse guardrails in component styles', () => {
    expect(seedMarkerLayerSource).toContain('width: 44px;')
    expect(seedMarkerLayerSource).toContain('height: 44px;')
    expect(seedMarkerLayerSource).toContain('@media (prefers-reduced-motion: reduce)')
    expect(seedMarkerLayerSource).toContain('animation: draft-marker-pulse 1.75s ease-in-out infinite;')
  })
})
