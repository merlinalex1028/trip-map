import countryRegions from './country-regions.geo.json'

export interface CityCandidate {
  id: string
  name: string
  countryCode: string
  contextLabel: string
  lat: number
  lng: number
  highRadiusKm: number
  possibleRadiusKm: number
  aliases: string[]
  contextKeys: string[]
}

interface GeoFeatureProperties {
  bbox: number[]
  countryCode: string
  countryName: string
}

interface CountryRegionFeature {
  type: 'Feature'
  properties: GeoFeatureProperties
}

interface CountryRegionFeatureCollection {
  type: 'FeatureCollection'
  features: CountryRegionFeature[]
}

interface CitySeed {
  countryCode: string
  name: string
  id?: string
  countryLabel?: string
  regionLabel?: string
  lat?: number
  lng?: number
  highRadiusKm?: number
  possibleRadiusKm?: number
  aliases?: string[]
  contextKeys?: string[]
}

const countryRegionFeatures = (countryRegions as CountryRegionFeatureCollection).features

const countryMetaByCode = countryRegionFeatures.reduce<
  Record<string, { countryName: string; bbox: [number, number, number, number] }>
>((accumulator, feature) => {
  const { countryCode, countryName, bbox } = feature.properties

  if (!accumulator[countryCode]) {
    accumulator[countryCode] = {
      countryName,
      bbox: [bbox[0] ?? 0, bbox[1] ?? 0, bbox[2] ?? 0, bbox[3] ?? 0]
    }
  }

  return accumulator
}, {})

const countryLabelOverrides: Record<string, string> = {
  CN: 'China',
  GL: 'Greenland',
  HK: 'Hong Kong',
  MO: 'Macau',
  TW: 'Taiwan',
  US: 'United States'
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getCountryCenter(countryCode: string) {
  const countryMeta = countryMetaByCode[countryCode]

  if (!countryMeta) {
    throw new Error(`Unknown country code: ${countryCode}`)
  }

  const [minLng, minLat, maxLng, maxLat] = countryMeta.bbox

  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2
  }
}

function defineCity(seed: CitySeed): CityCandidate {
  const countryCode = seed.countryCode.toUpperCase()
  const fallbackCenter = getCountryCenter(countryCode)
  const hasExplicitCoordinates = typeof seed.lat === 'number' && typeof seed.lng === 'number'
  const countryLabel =
    seed.countryLabel ?? countryLabelOverrides[countryCode] ?? countryMetaByCode[countryCode]?.countryName ?? countryCode
  const regionLabel = seed.regionLabel ?? seed.name

  return {
    id: seed.id ?? `${countryCode.toLowerCase()}-${slugify(seed.name)}`,
    name: seed.name,
    countryCode,
    contextLabel: `${countryLabel} · ${regionLabel}`,
    lat: seed.lat ?? fallbackCenter.lat,
    lng: seed.lng ?? fallbackCenter.lng,
    highRadiusKm: seed.highRadiusKm ?? (hasExplicitCoordinates ? 35 : -1),
    possibleRadiusKm: seed.possibleRadiusKm ?? (hasExplicitCoordinates ? 95 : 220),
    aliases: seed.aliases ?? [],
    contextKeys: seed.contextKeys ?? [`${countryCode}:country`]
  }
}

const curatedCitySeeds: CitySeed[] = [
  { countryCode: 'JP', name: 'Tokyo', regionLabel: 'Kanto', lat: 35.6762, lng: 139.6503, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['东京', 'とうきょう'], contextKeys: ['JP:country', 'JP:Kanto'] },
  { countryCode: 'JP', name: 'Kyoto', regionLabel: 'Kansai', lat: 35.0116, lng: 135.7681, highRadiusKm: 35, possibleRadiusKm: 90, aliases: ['京都'], contextKeys: ['JP:country', 'JP:Kansai'] },
  { countryCode: 'JP', name: 'Osaka', regionLabel: 'Kansai', lat: 34.6937, lng: 135.5023, highRadiusKm: 35, possibleRadiusKm: 90, aliases: ['大阪'], contextKeys: ['JP:country', 'JP:Kansai'] },
  { countryCode: 'PT', name: 'Lisbon', regionLabel: 'Lisbon District', lat: 38.7223, lng: -9.1393, highRadiusKm: 30, possibleRadiusKm: 80, aliases: ['里斯本'], contextKeys: ['PT:country', 'PT:Lisbon District'] },
  { countryCode: 'PT', name: 'Porto', regionLabel: 'Porto District', lat: 41.1579, lng: -8.6291, highRadiusKm: 30, possibleRadiusKm: 80, aliases: ['波尔图'], contextKeys: ['PT:country', 'PT:Porto District'] },
  { countryCode: 'EG', name: 'Cairo', regionLabel: 'Cairo Governorate', lat: 30.0444, lng: 31.2357, highRadiusKm: 35, possibleRadiusKm: 90, aliases: ['开罗'], contextKeys: ['EG:country', 'EG:Cairo Governorate'] },
  { countryCode: 'EG', name: 'Alexandria', regionLabel: 'Alexandria Governorate', lat: 31.2001, lng: 29.9187, highRadiusKm: 35, possibleRadiusKm: 90, aliases: ['亚历山大'], contextKeys: ['EG:country', 'EG:Alexandria Governorate'] },
  { countryCode: 'FR', name: 'Paris', regionLabel: 'Ile-de-France', lat: 48.8566, lng: 2.3522, highRadiusKm: 35, possibleRadiusKm: 110, aliases: ['巴黎'], contextKeys: ['FR:country', 'FR:Ile-de-France'] },
  { countryCode: 'FR', name: 'Lyon', regionLabel: 'Auvergne-Rhone-Alpes', lat: 45.764, lng: 4.8357, highRadiusKm: 30, possibleRadiusKm: 90, aliases: ['里昂'], contextKeys: ['FR:country', 'FR:Auvergne-Rhone-Alpes'] },
  { countryCode: 'FR', name: 'Marseille', regionLabel: "Provence-Alpes-Cote d'Azur", lat: 43.2965, lng: 5.3698, highRadiusKm: 30, possibleRadiusKm: 90, aliases: ['马赛'], contextKeys: ['FR:country', "FR:Provence-Alpes-Cote d'Azur"] },
  { countryCode: 'US', name: 'New York', regionLabel: 'New York', lat: 40.7128, lng: -74.006, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['纽约', '纽约市'], contextKeys: ['US:country', 'US:New York'] },
  { countryCode: 'US', name: 'San Francisco', regionLabel: 'California', lat: 37.7749, lng: -122.4194, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['旧金山', '三藩市'], contextKeys: ['US:country', 'US:California'] },
  { countryCode: 'US', name: 'Los Angeles', regionLabel: 'California', lat: 34.0522, lng: -118.2437, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['洛杉矶'], contextKeys: ['US:country', 'US:California'] },
  { countryCode: 'GB', name: 'London', regionLabel: 'England', lat: 51.5072, lng: -0.1276, highRadiusKm: 35, possibleRadiusKm: 100, aliases: ['伦敦'], contextKeys: ['GB:country', 'GB:England'] },
  { countryCode: 'GB', name: 'Manchester', regionLabel: 'England', lat: 53.4808, lng: -2.2426, highRadiusKm: 30, possibleRadiusKm: 85, aliases: ['曼彻斯特'], contextKeys: ['GB:country', 'GB:England'] },
  { countryCode: 'CN', name: 'Beijing', countryLabel: 'China', regionLabel: 'Beijing', lat: 39.9042, lng: 116.4074, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['北京'], contextKeys: ['CN:country', 'CN:Beijing'] },
  { countryCode: 'CN', name: 'Shanghai', countryLabel: 'China', regionLabel: 'Shanghai', lat: 31.2304, lng: 121.4737, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['上海'], contextKeys: ['CN:country', 'CN:Shanghai'] },
  { countryCode: 'CN', name: 'Guangzhou', countryLabel: 'China', regionLabel: 'Guangdong', lat: 23.1291, lng: 113.2644, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['广州'], contextKeys: ['CN:country', 'CN:Guangdong'] },
  { countryCode: 'HK', name: 'Hong Kong', countryLabel: 'Hong Kong', regionLabel: 'Central and Western', lat: 22.3193, lng: 114.1694, highRadiusKm: 30, possibleRadiusKm: 75, aliases: ['香港'], contextKeys: ['HK:country', 'HK:Hong Kong'] },
  { countryCode: 'IT', name: 'Rome', regionLabel: 'Lazio', lat: 41.9028, lng: 12.4964, highRadiusKm: 35, possibleRadiusKm: 100, aliases: ['罗马'], contextKeys: ['IT:country', 'IT:Lazio'] },
  { countryCode: 'IT', name: 'Milan', regionLabel: 'Lombardy', lat: 45.4642, lng: 9.19, highRadiusKm: 30, possibleRadiusKm: 90, aliases: ['米兰'], contextKeys: ['IT:country', 'IT:Lombardy'] },
  { countryCode: 'ES', name: 'Madrid', regionLabel: 'Community of Madrid', lat: 40.4168, lng: -3.7038, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['马德里'], contextKeys: ['ES:country', 'ES:Community of Madrid'] },
  { countryCode: 'ES', name: 'Barcelona', regionLabel: 'Catalonia', lat: 41.3874, lng: 2.1686, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['巴塞罗那'], contextKeys: ['ES:country', 'ES:Catalonia'] },
  { countryCode: 'DE', name: 'Berlin', regionLabel: 'Berlin', lat: 52.52, lng: 13.405, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['柏林'], contextKeys: ['DE:country', 'DE:Berlin'] },
  { countryCode: 'DE', name: 'Munich', regionLabel: 'Bavaria', lat: 48.1351, lng: 11.582, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['慕尼黑'], contextKeys: ['DE:country', 'DE:Bavaria'] },
  { countryCode: 'KR', name: 'Seoul', regionLabel: 'Seoul', lat: 37.5665, lng: 126.978, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['首尔', '首爾'], contextKeys: ['KR:country', 'KR:Seoul'] },
  { countryCode: 'KR', name: 'Busan', regionLabel: 'Busan', lat: 35.1796, lng: 129.0756, highRadiusKm: 35, possibleRadiusKm: 100, aliases: ['釜山'], contextKeys: ['KR:country', 'KR:Busan'] },
  { countryCode: 'TH', name: 'Bangkok', regionLabel: 'Bangkok', lat: 13.7563, lng: 100.5018, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['曼谷'], contextKeys: ['TH:country', 'TH:Bangkok'] },
  { countryCode: 'TH', name: 'Chiang Mai', regionLabel: 'Chiang Mai', lat: 18.7883, lng: 98.9853, highRadiusKm: 35, possibleRadiusKm: 100, aliases: ['清迈'], contextKeys: ['TH:country', 'TH:Chiang Mai'] },
  { countryCode: 'SG', name: 'Singapore', regionLabel: 'Central Region', lat: 1.3521, lng: 103.8198, highRadiusKm: 30, possibleRadiusKm: 70, aliases: ['新加坡'], contextKeys: ['SG:country', 'SG:Central Region'] },
  { countryCode: 'AU', name: 'Sydney', regionLabel: 'New South Wales', lat: -33.8688, lng: 151.2093, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['悉尼'], contextKeys: ['AU:country', 'AU:New South Wales'] },
  { countryCode: 'AU', name: 'Melbourne', regionLabel: 'Victoria', lat: -37.8136, lng: 144.9631, highRadiusKm: 45, possibleRadiusKm: 120, aliases: ['墨尔本'], contextKeys: ['AU:country', 'AU:Victoria'] },
  { countryCode: 'AE', name: 'Dubai', regionLabel: 'Dubai', lat: 25.2048, lng: 55.2708, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['迪拜'], contextKeys: ['AE:country', 'AE:Dubai'] },
  { countryCode: 'AE', name: 'Abu Dhabi', regionLabel: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['阿布扎比'], contextKeys: ['AE:country', 'AE:Abu Dhabi'] },
  { countryCode: 'TR', name: 'Istanbul', regionLabel: 'Marmara', lat: 41.0082, lng: 28.9784, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['伊斯坦布尔'], contextKeys: ['TR:country', 'TR:Marmara'] },
  { countryCode: 'TR', name: 'Ankara', regionLabel: 'Central Anatolia', lat: 39.9334, lng: 32.8597, highRadiusKm: 35, possibleRadiusKm: 95, aliases: ['安卡拉'], contextKeys: ['TR:country', 'TR:Central Anatolia'] },
  { countryCode: 'CA', name: 'Toronto', regionLabel: 'Ontario', lat: 43.6532, lng: -79.3832, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['多伦多'], contextKeys: ['CA:country', 'CA:Ontario'] },
  { countryCode: 'CA', name: 'Vancouver', regionLabel: 'British Columbia', lat: 49.2827, lng: -123.1207, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['温哥华'], contextKeys: ['CA:country', 'CA:British Columbia'] },
  { countryCode: 'AR', name: 'Buenos Aires', regionLabel: 'Buenos Aires', lat: -34.6037, lng: -58.3816, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['布宜诺斯艾利斯'], contextKeys: ['AR:country', 'AR:Buenos Aires'] },
  { countryCode: 'BR', name: 'Rio de Janeiro', regionLabel: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['里约热内卢'], contextKeys: ['BR:country', 'BR:Rio de Janeiro'] },
  { countryCode: 'BR', name: 'Sao Paulo', regionLabel: 'Sao Paulo', lat: -23.5558, lng: -46.6396, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['圣保罗'], contextKeys: ['BR:country', 'BR:Sao Paulo'] },
  { countryCode: 'IN', name: 'New Delhi', regionLabel: 'Delhi', lat: 28.6139, lng: 77.209, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['新德里'], contextKeys: ['IN:country', 'IN:Delhi'] },
  { countryCode: 'IN', name: 'Mumbai', regionLabel: 'Maharashtra', lat: 19.076, lng: 72.8777, highRadiusKm: 40, possibleRadiusKm: 110, aliases: ['孟买'], contextKeys: ['IN:country', 'IN:Maharashtra'] }
]

const primaryCoverageSeeds: CitySeed[] = [
  { countryCode: 'AD', name: 'Andorra la Vella' },
  { countryCode: 'AF', name: 'Kabul' },
  { countryCode: 'AG', name: "Saint John's" },
  { countryCode: 'AI', name: 'The Valley' },
  { countryCode: 'AL', name: 'Tirana' },
  { countryCode: 'AM', name: 'Yerevan' },
  { countryCode: 'AO', name: 'Luanda' },
  { countryCode: 'AS', name: 'Pago Pago' },
  { countryCode: 'AT', name: 'Vienna', aliases: ['维也纳'] },
  { countryCode: 'AW', name: 'Oranjestad' },
  { countryCode: 'AX', name: 'Mariehamn' },
  { countryCode: 'AZ', name: 'Baku' },
  { countryCode: 'BA', name: 'Sarajevo' },
  { countryCode: 'BB', name: 'Bridgetown' },
  { countryCode: 'BD', name: 'Dhaka' },
  { countryCode: 'BE', name: 'Brussels' },
  { countryCode: 'BF', name: 'Ouagadougou' },
  { countryCode: 'BG', name: 'Sofia' },
  { countryCode: 'BH', name: 'Manama' },
  { countryCode: 'BI', name: 'Bujumbura' },
  { countryCode: 'BJ', name: 'Cotonou' },
  { countryCode: 'BL', name: 'Gustavia' },
  { countryCode: 'BM', name: 'Hamilton' },
  { countryCode: 'BN', name: 'Bandar Seri Begawan' },
  { countryCode: 'BO', name: 'La Paz' },
  { countryCode: 'BS', name: 'Nassau' },
  { countryCode: 'BT', name: 'Thimphu' },
  { countryCode: 'BW', name: 'Gaborone' },
  { countryCode: 'BY', name: 'Minsk' },
  { countryCode: 'BZ', name: 'Belize City' },
  { countryCode: 'CD', name: 'Kinshasa' },
  { countryCode: 'CF', name: 'Bangui' },
  { countryCode: 'CG', name: 'Brazzaville' },
  { countryCode: 'CH', name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { countryCode: 'CK', name: 'Avarua' },
  { countryCode: 'CL', name: 'Santiago', aliases: ['圣地亚哥'] },
  { countryCode: 'CM', name: 'Yaounde' },
  { countryCode: 'CO', name: 'Bogota', lat: 4.711, lng: -74.0721, aliases: ['波哥大'] },
  { countryCode: 'CR', name: 'San Jose' },
  { countryCode: 'CU', name: 'Havana' },
  { countryCode: 'CV', name: 'Praia' },
  { countryCode: 'CW', name: 'Willemstad' },
  { countryCode: 'CY', name: 'Nicosia' },
  { countryCode: 'CZ', name: 'Prague', aliases: ['布拉格'] },
  { countryCode: 'DJ', name: 'Djibouti' },
  { countryCode: 'DK', name: 'Copenhagen' },
  { countryCode: 'DM', name: 'Roseau' },
  { countryCode: 'DO', name: 'Santo Domingo' },
  { countryCode: 'DZ', name: 'Algiers' },
  { countryCode: 'EC', name: 'Quito' },
  { countryCode: 'EE', name: 'Tallinn' },
  { countryCode: 'ER', name: 'Asmara' },
  { countryCode: 'ET', name: 'Addis Ababa' },
  { countryCode: 'FJ', name: 'Suva' },
  { countryCode: 'FK', name: 'Stanley' },
  { countryCode: 'FM', name: 'Palikir' },
  { countryCode: 'FO', name: 'Torshavn' },
  { countryCode: 'GA', name: 'Libreville' },
  { countryCode: 'GD', name: "Saint George's" },
  { countryCode: 'GE', name: 'Tbilisi' },
  { countryCode: 'GG', name: 'Saint Peter Port' },
  { countryCode: 'GH', name: 'Accra' },
  { countryCode: 'GI', name: 'Gibraltar' },
  { countryCode: 'GL', name: 'Nuuk', countryLabel: 'Greenland' },
  { countryCode: 'GM', name: 'Banjul' },
  { countryCode: 'GN', name: 'Conakry' },
  { countryCode: 'GQ', name: 'Malabo' },
  { countryCode: 'GR', name: 'Athens', aliases: ['雅典'] },
  { countryCode: 'GT', name: 'Guatemala City' },
  { countryCode: 'GU', name: 'Hagatna' },
  { countryCode: 'GW', name: 'Bissau' },
  { countryCode: 'GY', name: 'Georgetown' },
  { countryCode: 'HN', name: 'Tegucigalpa' },
  { countryCode: 'HR', name: 'Zagreb' },
  { countryCode: 'HT', name: 'Port-au-Prince' },
  { countryCode: 'HU', name: 'Budapest', lat: 47.4979, lng: 19.0402, aliases: ['布达佩斯'] },
  { countryCode: 'ID', name: 'Jakarta', lat: -6.2088, lng: 106.8456, aliases: ['雅加达'] },
  { countryCode: 'IE', name: 'Dublin' },
  { countryCode: 'IL', name: 'Jerusalem' },
  { countryCode: 'IM', name: 'Douglas' },
  { countryCode: 'IQ', name: 'Baghdad' },
  { countryCode: 'IR', name: 'Tehran' },
  { countryCode: 'IS', name: 'Reykjavik' },
  { countryCode: 'JE', name: 'Saint Helier' },
  { countryCode: 'JM', name: 'Kingston' },
  { countryCode: 'JO', name: 'Amman' },
  { countryCode: 'KE', name: 'Nairobi', lat: -1.2921, lng: 36.8219, aliases: ['内罗毕'] },
  { countryCode: 'KG', name: 'Bishkek' },
  { countryCode: 'KH', name: 'Phnom Penh' },
  { countryCode: 'KI', name: 'Tarawa' },
  { countryCode: 'KM', name: 'Moroni' },
  { countryCode: 'KN', name: 'Basseterre' },
  { countryCode: 'KP', name: 'Pyongyang' },
  { countryCode: 'KW', name: 'Kuwait City' },
  { countryCode: 'KY', name: 'George Town' },
  { countryCode: 'KZ', name: 'Astana', lat: 51.1694, lng: 71.4491 },
  { countryCode: 'LA', name: 'Vientiane' },
  { countryCode: 'LB', name: 'Beirut' },
  { countryCode: 'LC', name: 'Castries' },
  { countryCode: 'LI', name: 'Vaduz' },
  { countryCode: 'LK', name: 'Colombo' },
  { countryCode: 'LR', name: 'Monrovia' },
  { countryCode: 'LS', name: 'Maseru' },
  { countryCode: 'LT', name: 'Vilnius' },
  { countryCode: 'LU', name: 'Luxembourg' },
  { countryCode: 'LV', name: 'Riga' },
  { countryCode: 'LY', name: 'Tripoli' },
  { countryCode: 'MA', name: 'Rabat' },
  { countryCode: 'MC', name: 'Monaco' },
  { countryCode: 'MD', name: 'Chisinau' },
  { countryCode: 'ME', name: 'Podgorica' },
  { countryCode: 'MF', name: 'Marigot' },
  { countryCode: 'MG', name: 'Antananarivo' },
  { countryCode: 'MH', name: 'Majuro' },
  { countryCode: 'MK', name: 'Skopje' },
  { countryCode: 'ML', name: 'Bamako' },
  { countryCode: 'MM', name: 'Yangon', lat: 16.8661, lng: 96.1951 },
  { countryCode: 'MN', name: 'Ulaanbaatar' },
  { countryCode: 'MO', name: 'Macau', countryLabel: 'Macau' },
  { countryCode: 'MP', name: 'Saipan' },
  { countryCode: 'MR', name: 'Nouakchott' },
  { countryCode: 'MS', name: 'Brades' },
  { countryCode: 'MT', name: 'Valletta' },
  { countryCode: 'MU', name: 'Port Louis' },
  { countryCode: 'MV', name: 'Male' },
  { countryCode: 'MW', name: 'Lilongwe' },
  { countryCode: 'MX', name: 'Mexico City', lat: 19.4326, lng: -99.1332, aliases: ['墨西哥城'] },
  { countryCode: 'MY', name: 'Kuala Lumpur', lat: 3.139, lng: 101.6869 },
  { countryCode: 'MZ', name: 'Maputo' },
  { countryCode: 'NA', name: 'Windhoek' },
  { countryCode: 'NC', name: 'Noumea' },
  { countryCode: 'NE', name: 'Niamey' },
  { countryCode: 'NF', name: 'Kingston' },
  { countryCode: 'NG', name: 'Abuja', lat: 9.0765, lng: 7.3986 },
  { countryCode: 'NI', name: 'Managua' },
  { countryCode: 'NL', name: 'Amsterdam' },
  { countryCode: 'NO', name: 'Oslo' },
  { countryCode: 'NP', name: 'Kathmandu' },
  { countryCode: 'NR', name: 'Yaren' },
  { countryCode: 'NU', name: 'Alofi' },
  { countryCode: 'NZ', name: 'Auckland', lat: -36.8509, lng: 174.7645 },
  { countryCode: 'OM', name: 'Muscat' },
  { countryCode: 'PA', name: 'Panama City' },
  { countryCode: 'PE', name: 'Lima', lat: -12.0464, lng: -77.0428 },
  { countryCode: 'PF', name: 'Papeete' },
  { countryCode: 'PG', name: 'Port Moresby' },
  { countryCode: 'PH', name: 'Manila', lat: 14.5995, lng: 120.9842 },
  { countryCode: 'PK', name: 'Islamabad', lat: 33.6844, lng: 73.0479 },
  { countryCode: 'PL', name: 'Warsaw' },
  { countryCode: 'PM', name: 'Saint-Pierre' },
  { countryCode: 'PR', name: 'San Juan' },
  { countryCode: 'PS', name: 'Ramallah' },
  { countryCode: 'PW', name: 'Koror' },
  { countryCode: 'PY', name: 'Asuncion' },
  { countryCode: 'QA', name: 'Doha' },
  { countryCode: 'RO', name: 'Bucharest' },
  { countryCode: 'RS', name: 'Belgrade' },
  { countryCode: 'RU', name: 'Moscow', lat: 55.7558, lng: 37.6173 },
  { countryCode: 'RW', name: 'Kigali' },
  { countryCode: 'SA', name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
  { countryCode: 'SB', name: 'Honiara' },
  { countryCode: 'SC', name: 'Victoria' },
  { countryCode: 'SD', name: 'Khartoum' },
  { countryCode: 'SE', name: 'Stockholm' },
  { countryCode: 'SH', name: 'Jamestown' },
  { countryCode: 'SI', name: 'Ljubljana' },
  { countryCode: 'SK', name: 'Bratislava' },
  { countryCode: 'SL', name: 'Freetown' },
  { countryCode: 'SM', name: 'San Marino' },
  { countryCode: 'SN', name: 'Dakar' },
  { countryCode: 'SO', name: 'Mogadishu' },
  { countryCode: 'SS', name: 'Juba' },
  { countryCode: 'ST', name: 'Sao Tome' },
  { countryCode: 'SV', name: 'San Salvador' },
  { countryCode: 'SX', name: 'Philipsburg' },
  { countryCode: 'SY', name: 'Damascus' },
  { countryCode: 'SZ', name: 'Mbabane' },
  { countryCode: 'TC', name: 'Cockburn Town' },
  { countryCode: 'TD', name: "N'Djamena" },
  { countryCode: 'TG', name: 'Lome' },
  { countryCode: 'TJ', name: 'Dushanbe' },
  { countryCode: 'TL', name: 'Dili' },
  { countryCode: 'TM', name: 'Ashgabat' },
  { countryCode: 'TN', name: 'Tunis' },
  { countryCode: 'TO', name: "Nuku'alofa" },
  { countryCode: 'TT', name: 'Port of Spain' },
  { countryCode: 'TV', name: 'Funafuti' },
  { countryCode: 'TW', name: 'Taipei', countryLabel: 'Taiwan', lat: 25.033, lng: 121.5654 },
  { countryCode: 'TZ', name: 'Dar es Salaam', lat: -6.7924, lng: 39.2083 },
  { countryCode: 'UA', name: 'Kyiv', lat: 50.4501, lng: 30.5234 },
  { countryCode: 'UG', name: 'Kampala' },
  { countryCode: 'UY', name: 'Montevideo' },
  { countryCode: 'UZ', name: 'Tashkent', lat: 41.2995, lng: 69.2401 },
  { countryCode: 'VA', name: 'Vatican City' },
  { countryCode: 'VC', name: 'Kingstown' },
  { countryCode: 'VE', name: 'Caracas' },
  { countryCode: 'VG', name: 'Road Town' },
  { countryCode: 'VI', name: 'Charlotte Amalie' },
  { countryCode: 'VN', name: 'Hanoi', lat: 21.0278, lng: 105.8342 },
  { countryCode: 'VU', name: 'Port Vila' },
  { countryCode: 'WF', name: 'Mata Utu' },
  { countryCode: 'WS', name: 'Apia' },
  { countryCode: 'YE', name: 'Sanaa' },
  { countryCode: 'ZA', name: 'Johannesburg', lat: -26.2041, lng: 28.0473, aliases: ['约翰内斯堡'] },
  { countryCode: 'ZM', name: 'Lusaka' },
  { countryCode: 'ZW', name: 'Harare' }
]

const expandedTravelSeeds: CitySeed[] = [
  { countryCode: 'JP', name: 'Sapporo', regionLabel: 'Hokkaido', lat: 43.0618, lng: 141.3545, aliases: ['札幌'], contextKeys: ['JP:country', 'JP:Hokkaido'] },
  { countryCode: 'JP', name: 'Fukuoka', regionLabel: 'Kyushu', lat: 33.5904, lng: 130.4017, aliases: ['福冈'], contextKeys: ['JP:country', 'JP:Kyushu'] },
  { countryCode: 'JP', name: 'Naha', regionLabel: 'Okinawa', lat: 26.2124, lng: 127.6809, aliases: ['那霸'], contextKeys: ['JP:country', 'JP:Okinawa'] },
  { countryCode: 'US', name: 'Chicago', regionLabel: 'Illinois', lat: 41.8781, lng: -87.6298, aliases: ['芝加哥'], contextKeys: ['US:country', 'US:Illinois'] },
  { countryCode: 'US', name: 'Seattle', regionLabel: 'Washington', lat: 47.6062, lng: -122.3321, aliases: ['西雅图'], contextKeys: ['US:country', 'US:Washington'] },
  { countryCode: 'US', name: 'Miami', regionLabel: 'Florida', lat: 25.7617, lng: -80.1918, aliases: ['迈阿密'], contextKeys: ['US:country', 'US:Florida'] },
  { countryCode: 'US', name: 'Honolulu', regionLabel: 'Hawaii', lat: 21.3069, lng: -157.8583, aliases: ['檀香山'], contextKeys: ['US:country', 'US:Hawaii'] },
  { countryCode: 'FR', name: 'Nice', regionLabel: "Provence-Alpes-Cote d'Azur", lat: 43.7102, lng: 7.262, aliases: ['尼斯'], contextKeys: ['FR:country', "FR:Provence-Alpes-Cote d'Azur"] },
  { countryCode: 'FR', name: 'Bordeaux', regionLabel: 'Nouvelle-Aquitaine', lat: 44.8378, lng: -0.5792, aliases: ['波尔多'], contextKeys: ['FR:country', 'FR:Nouvelle-Aquitaine'] },
  { countryCode: 'GB', name: 'Edinburgh', regionLabel: 'Scotland', lat: 55.9533, lng: -3.1883, aliases: ['爱丁堡'], contextKeys: ['GB:country', 'GB:Scotland'] },
  { countryCode: 'GB', name: 'Birmingham', regionLabel: 'England', lat: 52.4862, lng: -1.8904, aliases: ['伯明翰'], contextKeys: ['GB:country', 'GB:England'] },
  { countryCode: 'CN', name: 'Shenzhen', countryLabel: 'China', regionLabel: 'Guangdong', lat: 22.5431, lng: 114.0579, aliases: ['深圳'], contextKeys: ['CN:country', 'CN:Guangdong'] },
  { countryCode: 'CN', name: 'Chengdu', countryLabel: 'China', regionLabel: 'Sichuan', lat: 30.5728, lng: 104.0668, aliases: ['成都'], contextKeys: ['CN:country', 'CN:Sichuan'] },
  { countryCode: 'CN', name: "Xi'an", countryLabel: 'China', regionLabel: 'Shaanxi', lat: 34.3416, lng: 108.9398, aliases: ['西安'], contextKeys: ['CN:country', 'CN:Shaanxi'] },
  { countryCode: 'IN', name: 'Bengaluru', regionLabel: 'Karnataka', lat: 12.9716, lng: 77.5946, aliases: ['班加罗尔'], contextKeys: ['IN:country', 'IN:Karnataka'] },
  { countryCode: 'IN', name: 'Kolkata', regionLabel: 'West Bengal', lat: 22.5726, lng: 88.3639, aliases: ['加尔各答'], contextKeys: ['IN:country', 'IN:West Bengal'] },
  { countryCode: 'IN', name: 'Chennai', regionLabel: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, aliases: ['金奈'], contextKeys: ['IN:country', 'IN:Tamil Nadu'] },
  { countryCode: 'AU', name: 'Brisbane', regionLabel: 'Queensland', lat: -27.4698, lng: 153.0251, aliases: ['布里斯班'], contextKeys: ['AU:country', 'AU:Queensland'] },
  { countryCode: 'AU', name: 'Perth', regionLabel: 'Western Australia', lat: -31.9505, lng: 115.8605, aliases: ['珀斯'], contextKeys: ['AU:country', 'AU:Western Australia'] },
  { countryCode: 'AU', name: 'Cairns', regionLabel: 'Queensland', lat: -16.9186, lng: 145.7781, aliases: ['凯恩斯'], contextKeys: ['AU:country', 'AU:Queensland'] },
  { countryCode: 'CA', name: 'Montreal', regionLabel: 'Quebec', lat: 45.5017, lng: -73.5673, aliases: ['蒙特利尔'], contextKeys: ['CA:country', 'CA:Quebec'] },
  { countryCode: 'CA', name: 'Calgary', regionLabel: 'Alberta', lat: 51.0447, lng: -114.0719, aliases: ['卡尔加里'], contextKeys: ['CA:country', 'CA:Alberta'] },
  { countryCode: 'BR', name: 'Brasilia', regionLabel: 'Federal District', lat: -15.7939, lng: -47.8828, aliases: ['巴西利亚'], contextKeys: ['BR:country', 'BR:Federal District'] },
  { countryCode: 'BR', name: 'Salvador', regionLabel: 'Bahia', lat: -12.9777, lng: -38.5016, aliases: ['萨尔瓦多'], contextKeys: ['BR:country', 'BR:Bahia'] },
  { countryCode: 'MX', name: 'Guadalajara', regionLabel: 'Jalisco', lat: 20.6597, lng: -103.3496, aliases: ['瓜达拉哈拉'], contextKeys: ['MX:country', 'MX:Jalisco'] },
  { countryCode: 'MX', name: 'Monterrey', regionLabel: 'Nuevo Leon', lat: 25.6866, lng: -100.3161, aliases: ['蒙特雷'], contextKeys: ['MX:country', 'MX:Nuevo Leon'] },
  { countryCode: 'MX', name: 'Cancun', regionLabel: 'Quintana Roo', lat: 21.1619, lng: -86.8515, aliases: ['坎昆'], contextKeys: ['MX:country', 'MX:Quintana Roo'] },
  { countryCode: 'DE', name: 'Hamburg', regionLabel: 'Hamburg', lat: 53.5511, lng: 9.9937, aliases: ['汉堡'], contextKeys: ['DE:country', 'DE:Hamburg'] },
  { countryCode: 'DE', name: 'Cologne', regionLabel: 'North Rhine-Westphalia', lat: 50.9375, lng: 6.9603, aliases: ['科隆'], contextKeys: ['DE:country', 'DE:North Rhine-Westphalia'] },
  { countryCode: 'ES', name: 'Valencia', regionLabel: 'Valencian Community', lat: 39.4699, lng: -0.3763, aliases: ['瓦伦西亚'], contextKeys: ['ES:country', 'ES:Valencian Community'] },
  { countryCode: 'ES', name: 'Seville', regionLabel: 'Andalusia', lat: 37.3891, lng: -5.9845, aliases: ['塞维利亚'], contextKeys: ['ES:country', 'ES:Andalusia'] },
  { countryCode: 'IT', name: 'Venice', regionLabel: 'Veneto', lat: 45.4408, lng: 12.3155, aliases: ['威尼斯'], contextKeys: ['IT:country', 'IT:Veneto'] },
  { countryCode: 'IT', name: 'Florence', regionLabel: 'Tuscany', lat: 43.7696, lng: 11.2558, aliases: ['佛罗伦萨'], contextKeys: ['IT:country', 'IT:Tuscany'] },
  { countryCode: 'IT', name: 'Naples', regionLabel: 'Campania', lat: 40.8518, lng: 14.2681, aliases: ['那不勒斯'], contextKeys: ['IT:country', 'IT:Campania'] },
  { countryCode: 'ZA', name: 'Cape Town', regionLabel: 'Western Cape', lat: -33.9249, lng: 18.4241, aliases: ['开普敦'], contextKeys: ['ZA:country', 'ZA:Western Cape'] },
  { countryCode: 'ZA', name: 'Durban', regionLabel: 'KwaZulu-Natal', lat: -29.8587, lng: 31.0218, aliases: ['德班'], contextKeys: ['ZA:country', 'ZA:KwaZulu-Natal'] },
  { countryCode: 'TR', name: 'Izmir', regionLabel: 'Aegean', lat: 38.4237, lng: 27.1428, aliases: ['伊兹密尔'], contextKeys: ['TR:country', 'TR:Aegean'] },
  { countryCode: 'TR', name: 'Antalya', regionLabel: 'Mediterranean', lat: 36.8969, lng: 30.7133, aliases: ['安塔利亚'], contextKeys: ['TR:country', 'TR:Mediterranean'] },
  { countryCode: 'CH', name: 'Geneva', regionLabel: 'Geneva', lat: 46.2044, lng: 6.1432, aliases: ['日内瓦'], contextKeys: ['CH:country', 'CH:Geneva'] },
  { countryCode: 'AT', name: 'Salzburg', regionLabel: 'Salzburg', lat: 47.8095, lng: 13.055, aliases: ['萨尔茨堡'], contextKeys: ['AT:country', 'AT:Salzburg'] },
  { countryCode: 'NL', name: 'Rotterdam', regionLabel: 'South Holland', lat: 51.9244, lng: 4.4777, aliases: ['鹿特丹'], contextKeys: ['NL:country', 'NL:South Holland'] },
  { countryCode: 'SE', name: 'Gothenburg', regionLabel: 'Vastra Gotaland', lat: 57.7089, lng: 11.9746, aliases: ['哥德堡'], contextKeys: ['SE:country', 'SE:Vastra Gotaland'] },
  { countryCode: 'NO', name: 'Bergen', regionLabel: 'Vestland', lat: 60.3913, lng: 5.3221, aliases: ['卑尔根'], contextKeys: ['NO:country', 'NO:Vestland'] },
  { countryCode: 'FI', name: 'Helsinki', lat: 60.1699, lng: 24.9384, aliases: ['赫尔辛基'] },
  { countryCode: 'FI', name: 'Turku', regionLabel: 'Southwest Finland', lat: 60.4518, lng: 22.2666, aliases: ['图尔库'], contextKeys: ['FI:country', 'FI:Southwest Finland'] },
  { countryCode: 'PL', name: 'Krakow', regionLabel: 'Lesser Poland', lat: 50.0647, lng: 19.945, aliases: ['克拉科夫'], contextKeys: ['PL:country', 'PL:Lesser Poland'] },
  { countryCode: 'CZ', name: 'Brno', regionLabel: 'South Moravia', lat: 49.1951, lng: 16.6068, aliases: ['布尔诺'], contextKeys: ['CZ:country', 'CZ:South Moravia'] },
  { countryCode: 'RO', name: 'Cluj-Napoca', regionLabel: 'Cluj', lat: 46.7712, lng: 23.6236, aliases: ['克卢日'], contextKeys: ['RO:country', 'RO:Cluj'] },
  { countryCode: 'UA', name: 'Lviv', regionLabel: 'Lviv Oblast', lat: 49.8397, lng: 24.0297, aliases: ['利沃夫'], contextKeys: ['UA:country', 'UA:Lviv Oblast'] },
  { countryCode: 'SA', name: 'Jeddah', regionLabel: 'Makkah', lat: 21.4858, lng: 39.1925, aliases: ['吉达'], contextKeys: ['SA:country', 'SA:Makkah'] },
  { countryCode: 'AE', name: 'Sharjah', regionLabel: 'Sharjah', lat: 25.3463, lng: 55.4209, aliases: ['沙迦'], contextKeys: ['AE:country', 'AE:Sharjah'] },
  { countryCode: 'MA', name: 'Casablanca', regionLabel: 'Casablanca-Settat', lat: 33.5731, lng: -7.5898, aliases: ['卡萨布兰卡'], contextKeys: ['MA:country', 'MA:Casablanca-Settat'] },
  { countryCode: 'MA', name: 'Marrakesh', regionLabel: 'Marrakesh-Safi', lat: 31.6295, lng: -7.9811, aliases: ['马拉喀什'], contextKeys: ['MA:country', 'MA:Marrakesh-Safi'] },
  { countryCode: 'KE', name: 'Mombasa', regionLabel: 'Coast', lat: -4.0435, lng: 39.6682, aliases: ['蒙巴萨'], contextKeys: ['KE:country', 'KE:Coast'] },
  { countryCode: 'NG', name: 'Lagos', regionLabel: 'Lagos', lat: 6.5244, lng: 3.3792, aliases: ['拉各斯'], contextKeys: ['NG:country', 'NG:Lagos'] },
  { countryCode: 'PK', name: 'Karachi', regionLabel: 'Sindh', lat: 24.8607, lng: 67.0011, aliases: ['卡拉奇'], contextKeys: ['PK:country', 'PK:Sindh'] },
  { countryCode: 'PK', name: 'Lahore', regionLabel: 'Punjab', lat: 31.5497, lng: 74.3436, aliases: ['拉合尔'], contextKeys: ['PK:country', 'PK:Punjab'] },
  { countryCode: 'BD', name: 'Chittagong', regionLabel: 'Chattogram', lat: 22.3569, lng: 91.7832, aliases: ['吉大港'], contextKeys: ['BD:country', 'BD:Chattogram'] },
  { countryCode: 'LK', name: 'Kandy', regionLabel: 'Central Province', lat: 7.2906, lng: 80.6337, aliases: ['康提'], contextKeys: ['LK:country', 'LK:Central Province'] },
  { countryCode: 'NP', name: 'Pokhara', regionLabel: 'Gandaki', lat: 28.2096, lng: 83.9856, aliases: ['博卡拉'], contextKeys: ['NP:country', 'NP:Gandaki'] },
  { countryCode: 'RU', name: 'Saint Petersburg', regionLabel: 'Saint Petersburg', lat: 59.9343, lng: 30.3351, aliases: ['圣彼得堡'], contextKeys: ['RU:country', 'RU:Saint Petersburg'] },
  { countryCode: 'RU', name: 'Vladivostok', regionLabel: 'Primorsky Krai', lat: 43.1155, lng: 131.8855, aliases: ['符拉迪沃斯托克'], contextKeys: ['RU:country', 'RU:Primorsky Krai'] },
  { countryCode: 'KZ', name: 'Almaty', regionLabel: 'Almaty', lat: 43.2389, lng: 76.8897, aliases: ['阿拉木图'], contextKeys: ['KZ:country', 'KZ:Almaty'] },
  { countryCode: 'UZ', name: 'Samarkand', regionLabel: 'Samarkand', lat: 39.627, lng: 66.975, aliases: ['撒马尔罕'], contextKeys: ['UZ:country', 'UZ:Samarkand'] },
  { countryCode: 'IR', name: 'Isfahan', regionLabel: 'Isfahan', lat: 32.6546, lng: 51.668, aliases: ['伊斯法罕'], contextKeys: ['IR:country', 'IR:Isfahan'] },
  { countryCode: 'IL', name: 'Tel Aviv', regionLabel: 'Tel Aviv', lat: 32.0853, lng: 34.7818, aliases: ['特拉维夫'], contextKeys: ['IL:country', 'IL:Tel Aviv'] },
  { countryCode: 'VN', name: 'Ho Chi Minh City', regionLabel: 'Ho Chi Minh City', lat: 10.8231, lng: 106.6297, aliases: ['胡志明市'], contextKeys: ['VN:country', 'VN:Ho Chi Minh City'] },
  { countryCode: 'VN', name: 'Da Nang', regionLabel: 'Da Nang', lat: 16.0544, lng: 108.2022, aliases: ['岘港'], contextKeys: ['VN:country', 'VN:Da Nang'] },
  { countryCode: 'ID', name: 'Surabaya', regionLabel: 'East Java', lat: -7.2575, lng: 112.7521, aliases: ['泗水'], contextKeys: ['ID:country', 'ID:East Java'] },
  { countryCode: 'ID', name: 'Denpasar', regionLabel: 'Bali', lat: -8.6705, lng: 115.2126, aliases: ['登巴萨'], contextKeys: ['ID:country', 'ID:Bali'] },
  { countryCode: 'MY', name: 'George Town', regionLabel: 'Penang', lat: 5.4141, lng: 100.3288, aliases: ['乔治市'], contextKeys: ['MY:country', 'MY:Penang'] },
  { countryCode: 'MY', name: 'Kota Kinabalu', regionLabel: 'Sabah', lat: 5.9804, lng: 116.0735, aliases: ['亚庇'], contextKeys: ['MY:country', 'MY:Sabah'] },
  { countryCode: 'NZ', name: 'Queenstown', regionLabel: 'Otago', lat: -45.0312, lng: 168.6626, aliases: ['皇后镇'], contextKeys: ['NZ:country', 'NZ:Otago'] },
  { countryCode: 'NZ', name: 'Christchurch', regionLabel: 'Canterbury', lat: -43.5321, lng: 172.6362, aliases: ['基督城'], contextKeys: ['NZ:country', 'NZ:Canterbury'] },
  { countryCode: 'AR', name: 'Cordoba', regionLabel: 'Cordoba', lat: -31.4201, lng: -64.1888, aliases: ['科尔多瓦'], contextKeys: ['AR:country', 'AR:Cordoba'] },
  { countryCode: 'AR', name: 'Mendoza', regionLabel: 'Mendoza', lat: -32.8895, lng: -68.8458, aliases: ['门多萨'], contextKeys: ['AR:country', 'AR:Mendoza'] },
  { countryCode: 'CO', name: 'Medellin', regionLabel: 'Antioquia', lat: 6.2442, lng: -75.5812, aliases: ['麦德林'], contextKeys: ['CO:country', 'CO:Antioquia'] },
  { countryCode: 'PE', name: 'Cusco', regionLabel: 'Cusco', lat: -13.5319, lng: -71.9675, aliases: ['库斯科'], contextKeys: ['PE:country', 'PE:Cusco'] },
  { countryCode: 'PH', name: 'Cebu City', regionLabel: 'Central Visayas', lat: 10.3157, lng: 123.8854, aliases: ['宿务'], contextKeys: ['PH:country', 'PH:Central Visayas'] }
]

const cityCandidateDefinitions = [
  ...curatedCitySeeds.map(defineCity),
  ...primaryCoverageSeeds.map(defineCity),
  ...expandedTravelSeeds.map(defineCity)
]

function groupByCountry(candidates: CityCandidate[]) {
  return candidates.reduce<Record<string, CityCandidate[]>>((accumulator, candidate) => {
    const nextCandidates = accumulator[candidate.countryCode] ?? []

    accumulator[candidate.countryCode] = [...nextCandidates, candidate]
    return accumulator
  }, {})
}

function groupByContext(candidates: CityCandidate[]) {
  return candidates.reduce<Record<string, CityCandidate[]>>((accumulator, candidate) => {
    for (const contextKey of candidate.contextKeys) {
      const nextCandidates = accumulator[contextKey] ?? []

      accumulator[contextKey] = [...nextCandidates, candidate]
    }

    return accumulator
  }, {})
}

const supportedCountryCodes = [...new Set(cityCandidateDefinitions.map((candidate) => candidate.countryCode))].sort()

export const countriesMissingCityCoverage = Object.entries(countryMetaByCode)
  .filter(([countryCode]) => !supportedCountryCodes.includes(countryCode))
  .map(([countryCode, meta]) => ({
    countryCode,
    countryName: countryLabelOverrides[countryCode] ?? meta.countryName
  }))
  .sort((left, right) => left.countryCode.localeCompare(right.countryCode))

export const cityCoverageStats = {
  totalCities: cityCandidateDefinitions.length,
  coveredCountryCodes: supportedCountryCodes,
  coveredCountryCount: supportedCountryCodes.length,
  totalCountryCount: Object.keys(countryMetaByCode).length,
  countriesMissingCoverageCount: countriesMissingCityCoverage.length
}

export const cityCandidates = cityCandidateDefinitions
export const cityCandidatesByCountry = groupByCountry(cityCandidateDefinitions)
export const cityCandidatesByContext = groupByContext(cityCandidateDefinitions)
