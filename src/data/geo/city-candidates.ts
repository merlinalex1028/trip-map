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

const cityCandidateDefinitions: CityCandidate[] = [
  {
    id: 'jp-tokyo',
    name: 'Tokyo',
    countryCode: 'JP',
    contextLabel: 'Japan · Kanto',
    lat: 35.6762,
    lng: 139.6503,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['东京', 'とうきょう'],
    contextKeys: ['JP:country', 'JP:Kanto']
  },
  {
    id: 'jp-kyoto',
    name: 'Kyoto',
    countryCode: 'JP',
    contextLabel: 'Japan · Kansai',
    lat: 35.0116,
    lng: 135.7681,
    highRadiusKm: 35,
    possibleRadiusKm: 90,
    aliases: ['京都'],
    contextKeys: ['JP:country', 'JP:Kansai']
  },
  {
    id: 'jp-osaka',
    name: 'Osaka',
    countryCode: 'JP',
    contextLabel: 'Japan · Kansai',
    lat: 34.6937,
    lng: 135.5023,
    highRadiusKm: 35,
    possibleRadiusKm: 90,
    aliases: ['大阪'],
    contextKeys: ['JP:country', 'JP:Kansai']
  },
  {
    id: 'pt-lisbon',
    name: 'Lisbon',
    countryCode: 'PT',
    contextLabel: 'Portugal · Lisbon District',
    lat: 38.7223,
    lng: -9.1393,
    highRadiusKm: 30,
    possibleRadiusKm: 80,
    aliases: ['里斯本'],
    contextKeys: ['PT:country', 'PT:Lisbon District']
  },
  {
    id: 'pt-porto',
    name: 'Porto',
    countryCode: 'PT',
    contextLabel: 'Portugal · Porto District',
    lat: 41.1579,
    lng: -8.6291,
    highRadiusKm: 30,
    possibleRadiusKm: 80,
    aliases: ['波尔图'],
    contextKeys: ['PT:country', 'PT:Porto District']
  },
  {
    id: 'eg-cairo',
    name: 'Cairo',
    countryCode: 'EG',
    contextLabel: 'Egypt · Cairo Governorate',
    lat: 30.0444,
    lng: 31.2357,
    highRadiusKm: 35,
    possibleRadiusKm: 90,
    aliases: ['开罗'],
    contextKeys: ['EG:country', 'EG:Cairo Governorate']
  },
  {
    id: 'eg-alexandria',
    name: 'Alexandria',
    countryCode: 'EG',
    contextLabel: 'Egypt · Alexandria Governorate',
    lat: 31.2001,
    lng: 29.9187,
    highRadiusKm: 35,
    possibleRadiusKm: 90,
    aliases: ['亚历山大'],
    contextKeys: ['EG:country', 'EG:Alexandria Governorate']
  },
  {
    id: 'fr-paris',
    name: 'Paris',
    countryCode: 'FR',
    contextLabel: 'France · Ile-de-France',
    lat: 48.8566,
    lng: 2.3522,
    highRadiusKm: 35,
    possibleRadiusKm: 110,
    aliases: ['巴黎'],
    contextKeys: ['FR:country', 'FR:Ile-de-France']
  },
  {
    id: 'fr-lyon',
    name: 'Lyon',
    countryCode: 'FR',
    contextLabel: 'France · Auvergne-Rhone-Alpes',
    lat: 45.764,
    lng: 4.8357,
    highRadiusKm: 30,
    possibleRadiusKm: 90,
    aliases: ['里昂'],
    contextKeys: ['FR:country', 'FR:Auvergne-Rhone-Alpes']
  },
  {
    id: 'fr-marseille',
    name: 'Marseille',
    countryCode: 'FR',
    contextLabel: 'France · Provence-Alpes-Cote d\'Azur',
    lat: 43.2965,
    lng: 5.3698,
    highRadiusKm: 30,
    possibleRadiusKm: 90,
    aliases: ['马赛'],
    contextKeys: ['FR:country', 'FR:Provence-Alpes-Cote d\'Azur']
  },
  {
    id: 'us-new-york',
    name: 'New York',
    countryCode: 'US',
    contextLabel: 'United States · New York',
    lat: 40.7128,
    lng: -74.006,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['纽约', '纽约市'],
    contextKeys: ['US:country', 'US:New York']
  },
  {
    id: 'us-san-francisco',
    name: 'San Francisco',
    countryCode: 'US',
    contextLabel: 'United States · California',
    lat: 37.7749,
    lng: -122.4194,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['旧金山', '三藩市'],
    contextKeys: ['US:country', 'US:California']
  },
  {
    id: 'us-los-angeles',
    name: 'Los Angeles',
    countryCode: 'US',
    contextLabel: 'United States · California',
    lat: 34.0522,
    lng: -118.2437,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['洛杉矶'],
    contextKeys: ['US:country', 'US:California']
  },
  {
    id: 'gb-london',
    name: 'London',
    countryCode: 'GB',
    contextLabel: 'United Kingdom · England',
    lat: 51.5072,
    lng: -0.1276,
    highRadiusKm: 35,
    possibleRadiusKm: 100,
    aliases: ['伦敦'],
    contextKeys: ['GB:country', 'GB:England']
  },
  {
    id: 'gb-manchester',
    name: 'Manchester',
    countryCode: 'GB',
    contextLabel: 'United Kingdom · England',
    lat: 53.4808,
    lng: -2.2426,
    highRadiusKm: 30,
    possibleRadiusKm: 85,
    aliases: ['曼彻斯特'],
    contextKeys: ['GB:country', 'GB:England']
  },
  {
    id: 'cn-beijing',
    name: 'Beijing',
    countryCode: 'CN',
    contextLabel: 'China · Beijing',
    lat: 39.9042,
    lng: 116.4074,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['北京'],
    contextKeys: ['CN:country', 'CN:Beijing']
  },
  {
    id: 'cn-shanghai',
    name: 'Shanghai',
    countryCode: 'CN',
    contextLabel: 'China · Shanghai',
    lat: 31.2304,
    lng: 121.4737,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['上海'],
    contextKeys: ['CN:country', 'CN:Shanghai']
  },
  {
    id: 'cn-guangzhou',
    name: 'Guangzhou',
    countryCode: 'CN',
    contextLabel: 'China · Guangdong',
    lat: 23.1291,
    lng: 113.2644,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['广州'],
    contextKeys: ['CN:country', 'CN:Guangdong']
  },
  {
    id: 'hk-hong-kong',
    name: 'Hong Kong',
    countryCode: 'HK',
    contextLabel: 'Hong Kong · Central and Western',
    lat: 22.3193,
    lng: 114.1694,
    highRadiusKm: 30,
    possibleRadiusKm: 75,
    aliases: ['香港'],
    contextKeys: ['HK:country', 'HK:Hong Kong']
  },
  {
    id: 'it-rome',
    name: 'Rome',
    countryCode: 'IT',
    contextLabel: 'Italy · Lazio',
    lat: 41.9028,
    lng: 12.4964,
    highRadiusKm: 35,
    possibleRadiusKm: 100,
    aliases: ['罗马'],
    contextKeys: ['IT:country', 'IT:Lazio']
  },
  {
    id: 'it-milan',
    name: 'Milan',
    countryCode: 'IT',
    contextLabel: 'Italy · Lombardy',
    lat: 45.4642,
    lng: 9.19,
    highRadiusKm: 30,
    possibleRadiusKm: 90,
    aliases: ['米兰'],
    contextKeys: ['IT:country', 'IT:Lombardy']
  },
  {
    id: 'es-madrid',
    name: 'Madrid',
    countryCode: 'ES',
    contextLabel: 'Spain · Community of Madrid',
    lat: 40.4168,
    lng: -3.7038,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['马德里'],
    contextKeys: ['ES:country', 'ES:Community of Madrid']
  },
  {
    id: 'es-barcelona',
    name: 'Barcelona',
    countryCode: 'ES',
    contextLabel: 'Spain · Catalonia',
    lat: 41.3874,
    lng: 2.1686,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['巴塞罗那'],
    contextKeys: ['ES:country', 'ES:Catalonia']
  },
  {
    id: 'de-berlin',
    name: 'Berlin',
    countryCode: 'DE',
    contextLabel: 'Germany · Berlin',
    lat: 52.52,
    lng: 13.405,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['柏林'],
    contextKeys: ['DE:country', 'DE:Berlin']
  },
  {
    id: 'de-munich',
    name: 'Munich',
    countryCode: 'DE',
    contextLabel: 'Germany · Bavaria',
    lat: 48.1351,
    lng: 11.582,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['慕尼黑'],
    contextKeys: ['DE:country', 'DE:Bavaria']
  },
  {
    id: 'kr-seoul',
    name: 'Seoul',
    countryCode: 'KR',
    contextLabel: 'South Korea · Seoul',
    lat: 37.5665,
    lng: 126.978,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['首尔', '首爾'],
    contextKeys: ['KR:country', 'KR:Seoul']
  },
  {
    id: 'kr-busan',
    name: 'Busan',
    countryCode: 'KR',
    contextLabel: 'South Korea · Busan',
    lat: 35.1796,
    lng: 129.0756,
    highRadiusKm: 35,
    possibleRadiusKm: 100,
    aliases: ['釜山'],
    contextKeys: ['KR:country', 'KR:Busan']
  },
  {
    id: 'th-bangkok',
    name: 'Bangkok',
    countryCode: 'TH',
    contextLabel: 'Thailand · Bangkok',
    lat: 13.7563,
    lng: 100.5018,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['曼谷'],
    contextKeys: ['TH:country', 'TH:Bangkok']
  },
  {
    id: 'th-chiang-mai',
    name: 'Chiang Mai',
    countryCode: 'TH',
    contextLabel: 'Thailand · Chiang Mai',
    lat: 18.7883,
    lng: 98.9853,
    highRadiusKm: 35,
    possibleRadiusKm: 100,
    aliases: ['清迈'],
    contextKeys: ['TH:country', 'TH:Chiang Mai']
  },
  {
    id: 'sg-singapore',
    name: 'Singapore',
    countryCode: 'SG',
    contextLabel: 'Singapore · Central Region',
    lat: 1.3521,
    lng: 103.8198,
    highRadiusKm: 30,
    possibleRadiusKm: 70,
    aliases: ['新加坡'],
    contextKeys: ['SG:country', 'SG:Central Region']
  },
  {
    id: 'au-sydney',
    name: 'Sydney',
    countryCode: 'AU',
    contextLabel: 'Australia · New South Wales',
    lat: -33.8688,
    lng: 151.2093,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['悉尼'],
    contextKeys: ['AU:country', 'AU:New South Wales']
  },
  {
    id: 'au-melbourne',
    name: 'Melbourne',
    countryCode: 'AU',
    contextLabel: 'Australia · Victoria',
    lat: -37.8136,
    lng: 144.9631,
    highRadiusKm: 45,
    possibleRadiusKm: 120,
    aliases: ['墨尔本'],
    contextKeys: ['AU:country', 'AU:Victoria']
  },
  {
    id: 'ae-dubai',
    name: 'Dubai',
    countryCode: 'AE',
    contextLabel: 'United Arab Emirates · Dubai',
    lat: 25.2048,
    lng: 55.2708,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['迪拜'],
    contextKeys: ['AE:country', 'AE:Dubai']
  },
  {
    id: 'ae-abu-dhabi',
    name: 'Abu Dhabi',
    countryCode: 'AE',
    contextLabel: 'United Arab Emirates · Abu Dhabi',
    lat: 24.4539,
    lng: 54.3773,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['阿布扎比'],
    contextKeys: ['AE:country', 'AE:Abu Dhabi']
  },
  {
    id: 'tr-istanbul',
    name: 'Istanbul',
    countryCode: 'TR',
    contextLabel: 'Turkey · Marmara',
    lat: 41.0082,
    lng: 28.9784,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['伊斯坦布尔'],
    contextKeys: ['TR:country', 'TR:Marmara']
  },
  {
    id: 'tr-ankara',
    name: 'Ankara',
    countryCode: 'TR',
    contextLabel: 'Turkey · Central Anatolia',
    lat: 39.9334,
    lng: 32.8597,
    highRadiusKm: 35,
    possibleRadiusKm: 95,
    aliases: ['安卡拉'],
    contextKeys: ['TR:country', 'TR:Central Anatolia']
  },
  {
    id: 'ca-toronto',
    name: 'Toronto',
    countryCode: 'CA',
    contextLabel: 'Canada · Ontario',
    lat: 43.6532,
    lng: -79.3832,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['多伦多'],
    contextKeys: ['CA:country', 'CA:Ontario']
  },
  {
    id: 'ca-vancouver',
    name: 'Vancouver',
    countryCode: 'CA',
    contextLabel: 'Canada · British Columbia',
    lat: 49.2827,
    lng: -123.1207,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['温哥华'],
    contextKeys: ['CA:country', 'CA:British Columbia']
  },
  {
    id: 'ar-buenos-aires',
    name: 'Buenos Aires',
    countryCode: 'AR',
    contextLabel: 'Argentina · Buenos Aires',
    lat: -34.6037,
    lng: -58.3816,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['布宜诺斯艾利斯'],
    contextKeys: ['AR:country', 'AR:Buenos Aires']
  },
  {
    id: 'br-rio-de-janeiro',
    name: 'Rio de Janeiro',
    countryCode: 'BR',
    contextLabel: 'Brazil · Rio de Janeiro',
    lat: -22.9068,
    lng: -43.1729,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['里约热内卢'],
    contextKeys: ['BR:country', 'BR:Rio de Janeiro']
  },
  {
    id: 'br-sao-paulo',
    name: 'Sao Paulo',
    countryCode: 'BR',
    contextLabel: 'Brazil · Sao Paulo',
    lat: -23.5558,
    lng: -46.6396,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['圣保罗'],
    contextKeys: ['BR:country', 'BR:Sao Paulo']
  },
  {
    id: 'in-new-delhi',
    name: 'New Delhi',
    countryCode: 'IN',
    contextLabel: 'India · Delhi',
    lat: 28.6139,
    lng: 77.209,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['新德里'],
    contextKeys: ['IN:country', 'IN:Delhi']
  },
  {
    id: 'in-mumbai',
    name: 'Mumbai',
    countryCode: 'IN',
    contextLabel: 'India · Maharashtra',
    lat: 19.076,
    lng: 72.8777,
    highRadiusKm: 40,
    possibleRadiusKm: 110,
    aliases: ['孟买'],
    contextKeys: ['IN:country', 'IN:Maharashtra']
  }
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

export const cityCandidates = cityCandidateDefinitions
export const cityCandidatesByCountry = groupByCountry(cityCandidateDefinitions)
export const cityCandidatesByContext = groupByContext(cityCandidateDefinitions)
