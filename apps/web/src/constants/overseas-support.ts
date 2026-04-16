export const PHASE26_SUPPORTED_OVERSEAS_COUNTRIES = [
  '日本',
  '韩国',
  '泰国',
  '新加坡',
  '马来西亚',
  '阿联酋',
  '澳大利亚',
  '美国',
] as const

export const PHASE26_SUPPORTED_OVERSEAS_COUNTRY_LABEL =
  PHASE26_SUPPORTED_OVERSEAS_COUNTRIES.join('、')

export function buildUnsupportedOverseasNotice(regionName?: string | null) {
  const detectedRegionName = regionName?.trim() || '该地区'

  return `已识别到${detectedRegionName}。 当前暂不支持点亮，请优先在${PHASE26_SUPPORTED_OVERSEAS_COUNTRY_LABEL}的一级行政区使用。`
}
