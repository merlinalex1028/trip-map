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

export const asiaCountryDefinitions = [
  {
    iso2: 'JP',
    iso3: 'JPN',
    labelEn: 'Japan',
    labelZh: '日本',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Prefecture',
    matchesFeature: createAdmin1Matcher('JP', 'JPN'),
  },
  {
    iso2: 'KR',
    iso3: 'KOR',
    labelEn: 'South Korea',
    labelZh: '韩国',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('KR', 'KOR'),
  },
  {
    iso2: 'TH',
    iso3: 'THA',
    labelEn: 'Thailand',
    labelZh: '泰国',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('TH', 'THA'),
  },
  {
    iso2: 'SG',
    iso3: 'SGP',
    labelEn: 'Singapore',
    labelZh: '新加坡',
    regionKey: 'asia',
    mode: 'allow-list',
    defaultTypeLabel: 'Region',
    allowedSourceFeatureIds: ['SG-01', 'SG-02', 'SG-03', 'SG-04', 'SG-05'],
    matchesFeature: createAdmin1Matcher('SG', 'SGP'),
  },
  {
    iso2: 'MY',
    iso3: 'MYS',
    labelEn: 'Malaysia',
    labelZh: '马来西亚',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'State',
    matchesFeature: createAdmin1Matcher('MY', 'MYS'),
  },
  {
    iso2: 'IN',
    iso3: 'IND',
    labelEn: 'India',
    labelZh: '印度',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'State',
    matchesFeature: createAdmin1Matcher('IN', 'IND'),
  },
  {
    iso2: 'ID',
    iso3: 'IDN',
    labelEn: 'Indonesia',
    labelZh: '印度尼西亚',
    regionKey: 'asia',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature: createAdmin1Matcher('ID', 'IDN'),
  },
]
