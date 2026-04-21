export {
  SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH,
  SUPPORTED_OVERSEAS_COUNTRY_SUMMARIES,
} from '@trip-map/contracts'
import { SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH } from '@trip-map/contracts'

export function buildUnsupportedOverseasNotice(regionName?: string | null) {
  const detectedRegionName = regionName?.trim() || '该地区'

  return `已识别到${detectedRegionName}。 当前暂不支持点亮，请优先在${SUPPORTED_OVERSEAS_COUNTRY_LABEL_ZH}的一级行政区级别边界使用。`
}
