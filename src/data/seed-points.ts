import { formatCoordinatesLabel, geoCoordinatesToNormalizedPoint } from '../services/map-projection'
import type { MapPointDisplay } from '../types/map-point'

const seedPointDefinitions = [
  {
    id: 'seed-lisbon',
    name: 'Lisbon',
    countryName: 'Portugal',
    countryCode: 'PT',
    lat: 38.7223,
    lng: -9.1393,
    isFeatured: true,
    description: '沿着大西洋海岸展开的山城港口，是这张旅行海报里的第一束暖光。'
  },
  {
    id: 'seed-cairo',
    name: 'Cairo',
    countryName: 'Egypt',
    countryCode: 'EG',
    lat: 30.0444,
    lng: 31.2357,
    isFeatured: true,
    description: '在沙色与河流交界处留下的一枚地标，适合做海报里的东方锚点。'
  },
  {
    id: 'seed-kyoto',
    name: 'Kyoto',
    countryName: 'Japan',
    countryCode: 'JP',
    lat: 35.0116,
    lng: 135.7681,
    isFeatured: false,
    description: '远东边缘的一枚安静落点，让版面保持稀疏而完整。'
  },
  {
    id: 'seed-buenos-aires',
    name: 'Buenos Aires',
    countryName: 'Argentina',
    countryCode: 'AR',
    lat: -34.6037,
    lng: -58.3816,
    isFeatured: false,
    description: '向南延展的一颗尾点，让整张地图的旅行感更完整。'
  }
] as const

export const seedPoints: MapPointDisplay[] = seedPointDefinitions.map((definition) => {
  const point = geoCoordinatesToNormalizedPoint({
    lat: definition.lat,
    lng: definition.lng
  })

  return {
    ...definition,
    ...point,
    source: 'seed',
    precision: 'city-high',
    cityId: `seed-${definition.id.replace(/^seed-/, '')}`,
    cityName: definition.name,
    cityContextLabel: definition.countryName,
    boundaryId: null,
    boundaryDatasetVersion: null,
    fallbackNotice: null,
    coordinatesLabel: formatCoordinatesLabel({
      lat: definition.lat,
      lng: definition.lng
    })
  }
})
