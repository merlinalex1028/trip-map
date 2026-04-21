function isCountryFeature(iso2, iso3, featureProperties) {
  const featureIso2 = String(featureProperties.iso_a2 ?? '').toUpperCase()
  const featureIso3 = String(featureProperties.adm0_a3 ?? '').toUpperCase()
  return featureIso2 === iso2 || featureIso3 === iso3
}

function isAdmin1Feature(featureProperties) {
  return Number(featureProperties.gadm_level) === 1
}

export const oceaniaCountryDefinitions = [
  {
    iso2: 'AU',
    iso3: 'AUS',
    labelEn: 'Australia',
    labelZh: '澳大利亚',
    regionKey: 'oceania',
    mode: 'allow-list',
    defaultTypeLabel: 'State',
    allowedSourceFeatureIds: ['AU-WA', 'AU-NT', 'AU-SA', 'AU-QLD', 'AU-NSW', 'AU-VIC', 'AU-TAS', 'AU-ACT'],
    deniedSourceFeatureIds: ['AU-X02~', 'AU-X03~', 'AU-X04~'],
    matchesFeature(featureProperties) {
      return featureProperties.adm0_a3 === 'AUS' && Number(featureProperties.gadm_level) === 1
    },
  },
  {
    iso2: 'PG',
    iso3: 'PNG',
    labelEn: 'Papua New Guinea',
    labelZh: '巴布亚新几内亚',
    regionKey: 'oceania',
    mode: 'allow-all-admin1',
    defaultTypeLabel: 'Province',
    matchesFeature(featureProperties) {
      return isCountryFeature('PG', 'PNG', featureProperties)
        && isAdmin1Feature(featureProperties)
    },
  },
]
