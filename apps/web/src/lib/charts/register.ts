import { use, registerTheme } from 'echarts/core'
import { LineChart, PieChart, BarChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { YUME_KAWAII_CHART_THEME, yumeKawaiiChartTheme } from './theme'

use([
  LineChart,
  PieChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DatasetComponent,
  TransformComponent,
  CanvasRenderer,
])

registerTheme(YUME_KAWAII_CHART_THEME, yumeKawaiiChartTheme)
