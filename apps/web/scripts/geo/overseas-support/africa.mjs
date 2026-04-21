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

export const africaCountryDefinitions = [
  {
    iso2: 'EG',
    iso3: 'EGY',
    labelEn: 'Egypt',
    labelZh: '埃及',
    regionKey: 'africa',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Governorate',
    matchesFeature: createAdmin1Matcher('EG', 'EGY'),
  },
  {
    iso2: 'MA',
    iso3: 'MAR',
    labelEn: 'Morocco',
    labelZh: '摩洛哥',
    regionKey: 'africa',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Region',
    matchesFeature: createAdmin1Matcher('MA', 'MAR'),
  },
  {
    iso2: 'ZA',
    iso3: 'ZAF',
    labelEn: 'South Africa',
    labelZh: '南非',
    regionKey: 'africa',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('ZA', 'ZAF'),
  },
]
