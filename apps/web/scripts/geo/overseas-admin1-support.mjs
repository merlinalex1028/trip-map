const priorityCountries = ['JP', 'KR', 'TH', 'SG', 'MY', 'AE', 'AU', 'US']

const priorityCountrySet = new Set(priorityCountries)
const priorityCountryByIso3 = new Map([
  ['JPN', 'JP'],
  ['KOR', 'KR'],
  ['THA', 'TH'],
  ['SGP', 'SG'],
  ['MYS', 'MY'],
  ['ARE', 'AE'],
  ['AUS', 'AU'],
  ['USA', 'US'],
])

const overseasAdmin1SupportCatalog = {
  priorityCountries,
  countries: {
    JP: {
      mode: 'allow-all-admin1',
    },
    KR: {
      mode: 'allow-all-admin1',
    },
    TH: {
      mode: 'allow-all-admin1',
    },
    SG: {
      mode: 'allow-list',
      allowedSourceFeatureIds: ['SG-01', 'SG-02', 'SG-03', 'SG-04', 'SG-05'],
    },
    MY: {
      mode: 'allow-all-admin1',
    },
    AE: {
      mode: 'allow-list',
      allowedSourceFeatureIds: ['AE-FU', 'AE-SH', 'AE-RK', 'AE-DU', 'AE-AZ', 'AE-UQ', 'AE-AJ'],
      deniedSourceFeatureIds: ['AE-X01~', 'AE-X02~'],
    },
    AU: {
      mode: 'allow-list',
      allowedSourceFeatureIds: ['AU-WA', 'AU-NT', 'AU-SA', 'AU-QLD', 'AU-NSW', 'AU-VIC', 'AU-TAS', 'AU-ACT'],
      deniedSourceFeatureIds: ['AU-X02~', 'AU-X03~', 'AU-X04~'],
    },
    US: {
      mode: 'allow-all-admin1',
    },
  },
}

function resolvePriorityCountryCode(featureProperties) {
  const iso2 = String(featureProperties.iso_a2 ?? '').toUpperCase()
  if (priorityCountrySet.has(iso2)) {
    return iso2
  }

  const iso3 = String(featureProperties.adm0_a3 ?? '').toUpperCase()
  return priorityCountryByIso3.get(iso3) ?? null
}

function getSourceFeatureId(featureProperties) {
  const admin1Name = featureProperties.name_en ?? featureProperties.name
  return featureProperties.iso_3166_2 ?? `${featureProperties.adm0_a3}/${admin1Name}`
}

function matchesCountrySpecificGuard(countryCode, featureProperties) {
  if (countryCode === 'AU') {
    return featureProperties.adm0_a3 === 'AUS' && Number(featureProperties.gadm_level) === 1
  }

  return true
}

export function isSupportedOverseasAdmin1Feature(featureProperties) {
  const countryCode = resolvePriorityCountryCode(featureProperties)
  if (!countryCode) {
    return false
  }

  const countrySupport = overseasAdmin1SupportCatalog.countries[countryCode]
  if (!countrySupport) {
    return false
  }

  const sourceFeatureId = getSourceFeatureId(featureProperties)

  if (countrySupport.deniedSourceFeatureIds?.includes(sourceFeatureId)) {
    return false
  }

  if (!matchesCountrySpecificGuard(countryCode, featureProperties)) {
    return false
  }

  if (countrySupport.mode === 'allow-all-admin1') {
    return true
  }

  return countrySupport.allowedSourceFeatureIds.includes(sourceFeatureId)
}

export {
  getSourceFeatureId as getOverseasAdmin1SourceFeatureId,
  overseasAdmin1SupportCatalog,
  priorityCountries,
}
