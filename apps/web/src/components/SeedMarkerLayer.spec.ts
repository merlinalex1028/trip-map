import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import SeedMarkerLayer from './SeedMarkerLayer.vue'
import seedMarkerLayerSource from './SeedMarkerLayer.vue?raw'

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

  it('builds aria labels that distinguish saved and draft markers', () => {
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

    expect(buttons[0]?.attributes('aria-label')).toBe('Japan，Japan，35.0000°N, 135.0000°E')
    expect(buttons[1]?.attributes('aria-label')).toBe('Kyoto，Japan，35.0100°N, 135.7600°E，未保存地点')
  })

  it('applies selected and dimmed marker states', () => {
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

    expect(markers[0]?.classes()).toContain('seed-marker--selected')
    expect(markers[1]?.classes()).toContain('seed-marker--dimmed')
    expect(wrapper.get('[data-point-id="saved-japan"]').element.closest('.seed-marker')?.getAttribute('data-marker-state')).toBe(
      'selected'
    )
  })

  it('keeps the marker hit target and reduced-motion guardrails in component styles', () => {
    expect(seedMarkerLayerSource).toContain('width: 44px;')
    expect(seedMarkerLayerSource).toContain('height: 44px;')
    expect(seedMarkerLayerSource).toContain('@media (prefers-reduced-motion: reduce)')
  })
})
