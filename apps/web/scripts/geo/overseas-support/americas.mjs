function isCountryFeature(iso2, iso3, featureProperties) {
  const featureIso2 = String(featureProperties.iso_a2 ?? '').toUpperCase()
  const featureIso3 = String(featureProperties.adm0_a3 ?? '').toUpperCase()
  return featureIso2 === iso2 || featureIso3 === iso3
}

function isAdmin1Feature(featureProperties) {
  return Number(featureProperties.gadm_level) === 1
}

function createAdmin1Matcher(iso2, iso3) {
  return featureProperties => isCountryFeature(iso2, iso3, featureProperties)
    && isAdmin1Feature(featureProperties)
}

export const americasCountryDefinitions = [
  {
    iso2: 'US',
    iso3: 'USA',
    labelEn: 'United States',
    labelZh: '美国',
    regionKey: 'americas',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'State',
    matchesFeature: createAdmin1Matcher('US', 'USA'),
  },
  {
    iso2: 'CA',
    iso3: 'CAN',
    labelEn: 'Canada',
    labelZh: '加拿大',
    regionKey: 'americas',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('CA', 'CAN'),
  },
  {
    iso2: 'BR',
    iso3: 'BRA',
    labelEn: 'Brazil',
    labelZh: '巴西',
    regionKey: 'americas',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'State',
    matchesFeature: createAdmin1Matcher('BR', 'BRA'),
  },
  {
    iso2: 'AR',
    iso3: 'ARG',
    labelEn: 'Argentina',
    labelZh: '阿根廷',
    regionKey: 'americas',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('AR', 'ARG'),
  },
]
