import { africaCountryDefinitions } from './africa.mjs'
import { americasCountryDefinitions } from './americas.mjs'
import { asiaCountryDefinitions } from './asia.mjs'
import { europeCountryDefinitions } from './europe.mjs'
import { middleEastCountryDefinitions } from './middle-east.mjs'
import { oceaniaCountryDefinitions } from './oceania.mjs'

const allCountryDefinitions = [
  ...asiaCountryDefinitions,
  ...middleEastCountryDefinitions,
  ...oceaniaCountryDefinitions,
  ...americasCountryDefinitions,
  ...europeCountryDefinitions,
  ...africaCountryDefinitions,
]

const countryDefinitionByIso2 = new Map(
  allCountryDefinitions.map(countryDefinition => [countryDefinition.iso2, countryDefinition]),
)

export const priorityCountries = allCountryDefinitions.map(countryDefinition => countryDefinition.iso2)

export const priorityCountryByIso3 = new Map(
  allCountryDefinitions.map(countryDefinition => [countryDefinition.iso3, countryDefinition.iso2]),
)

export const supportedCountrySummaries = allCountryDefinitions.map(({
  iso2,
  labelEn,
  labelZh,
  regionKey,
  defaultTypeLabel,
}) => ({
  iso2,
  labelEn,
  labelZh,
  regionKey,
  defaultTypeLabel,
}))

export const overseasAdmin1SupportCatalog = {
  priorityCountries,
  countries: Object.fromEntries(
    allCountryDefinitions.map(countryDefinition => [countryDefinition.iso2, countryDefinition]),
  ),
}

function resolvePriorityCountryCode(featureProperties) {
  const iso2 = String(featureProperties.iso_a2 ?? '').toUpperCase()
  if (countryDefinitionByIso2.has(iso2)) {
    return iso2
  }

  const iso3 = String(featureProperties.adm0_a3 ?? '').toUpperCase()
  return priorityCountryByIso3.get(iso3) ?? null
}

export function getOverseasAdmin1SourceFeatureId(featureProperties) {
  const admin1Name = featureProperties.name_en ?? featureProperties.name
  return featureProperties.iso_3166_2 ?? `${featureProperties.adm0_a3}/${admin1Name}`
}

export function getOverseasAdmin1CountryDefinition(input) {
  if (typeof input === 'string') {
    return countryDefinitionByIso2.get(String(input).toUpperCase()) ?? null
  }

  const countryCode = resolvePriorityCountryCode(input ?? {})
  if (!countryCode) {
    return null
  }

  return countryDefinitionByIso2.get(countryCode) ?? null
}

export function isSupportedOverseasAdmin1Feature(featureProperties) {
  const countryDefinition = getOverseasAdmin1CountryDefinition(featureProperties)
  if (!countryDefinition || !countryDefinition.matchesFeature(featureProperties)) {
    return false
  }

  const sourceFeatureId = getOverseasAdmin1SourceFeatureId(featureProperties)

  if (countryDefinition.deniedSourceFeatureIds?.includes(sourceFeatureId)) {
    return false
  }

  if (countryDefinition.mode === 'allow-all-admin1') {
    return true
  }

  if (countryDefinition.mode === 'allow-list') {
    return countryDefinition.allowedSourceFeatureIds?.includes(sourceFeatureId) ?? false
  }

  return false
}
