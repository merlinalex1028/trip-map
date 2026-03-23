import type { MapPointDisplay } from '../types/map-point'

export const seedPoints: MapPointDisplay[] = [
  {
    id: 'seed-lisbon',
    name: 'Lisbon',
    countryName: 'Portugal',
    x: 0.265,
    y: 0.405,
    source: 'seed',
    isFeatured: true,
    description: '沿着大西洋海岸展开的山城港口，是这张旅行海报里的第一束暖光。',
    coordinatesLabel: '38.72°N, 9.14°W'
  },
  {
    id: 'seed-cairo',
    name: 'Cairo',
    countryName: 'Egypt',
    x: 0.565,
    y: 0.435,
    source: 'seed',
    isFeatured: true,
    description: '在沙色与河流交界处留下的一枚地标，适合做海报里的东方锚点。',
    coordinatesLabel: '30.04°N, 31.24°E'
  },
  {
    id: 'seed-kyoto',
    name: 'Kyoto',
    countryName: 'Japan',
    x: 0.835,
    y: 0.395,
    source: 'seed',
    isFeatured: false,
    description: '远东边缘的一枚安静落点，让版面保持稀疏而完整。',
    coordinatesLabel: '35.01°N, 135.77°E'
  },
  {
    id: 'seed-buenos-aires',
    name: 'Buenos Aires',
    countryName: 'Argentina',
    x: 0.315,
    y: 0.765,
    source: 'seed',
    isFeatured: false,
    description: '向南延展的一颗尾点，让整张地图的旅行感更完整。',
    coordinatesLabel: '34.60°S, 58.38°W'
  }
]
