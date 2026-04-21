function isCountryFeature(iso2, iso3, featureProperties) {
  const featureIso2 = String(featureProperties.iso_a2 ?? '').toUpperCase()
  const featureIso3 = String(featureProperties.adm0_a3 ?? '').toUpperCase()
  return featureIso2 === iso2 || featureIso3 === iso3
}

function isAdmin1Feature(featureProperties) {
  return Number(featureProperties.gadm_level) === 1
}

export const middleEastCountryDefinitions = [
  {
    iso2: 'AE',
    iso3: 'ARE',
    labelEn: 'United Arab Emirates',
    labelZh: '阿联酋',
    regionKey: 'middle-east',
    mode: 'allow-list',
    defaultTypeLabel: 'Emirate',
    allowedSourceFeatureIds: ['AE-FU', 'AE-SH', 'AE-RK', 'AE-DU', 'AE-AZ', 'AE-UQ', 'AE-AJ'],
    deniedSourceFeatureIds: ['AE-X01~', 'AE-X02~'],
    matchesFeature(featureProperties) {
      return isCountryFeature('AE', 'ARE', featureProperties)
        && isAdmin1Feature(featureProperties)
    },
  },
  {
    iso2: 'SA',
    iso3: 'SAU',
    labelEn: 'Saudi Arabia',
    labelZh: '沙特阿拉伯',
    regionKey: 'middle-east',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Region',
    matchesFeature(featureProperties) {
      return isCountryFeature('SA', 'SAU', featureProperties)
        && isAdmin1Feature(featureProperties)
    },
  },
]
