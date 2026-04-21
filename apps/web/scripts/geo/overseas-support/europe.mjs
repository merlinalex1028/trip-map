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

export const europeCountryDefinitions = [
  {
    iso2: 'DE',
    iso3: 'DEU',
    labelEn: 'Germany',
    labelZh: '德国',
    regionKey: 'europe',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'State',
    matchesFeature: createAdmin1Matcher('DE', 'DEU'),
  },
  {
    iso2: 'PL',
    iso3: 'POL',
    labelEn: 'Poland',
    labelZh: '波兰',
    regionKey: 'europe',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('PL', 'POL'),
  },
  {
    iso2: 'CZ',
    iso3: 'CZE',
    labelEn: 'Czech Republic',
    labelZh: '捷克',
    regionKey: 'europe',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Region',
    matchesFeature: createAdmin1Matcher('CZ', 'CZE'),
  },
]
