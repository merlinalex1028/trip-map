export const YUME_KAWAII_CHART_THEME = 'yume-kawaii'

export const yumeKawaiiChartTheme = {
  color: ['#F75A9B', '#8B6FEF', '#5EA7F2', '#7ED9B6', '#F5A354'],
  textStyle: {
    color: '#25146F',
    fontFamily: "'Nunito Variable', 'Noto Sans SC', sans-serif",
  },
  title: {
    textStyle: { color: '#25146F' },
    subtextStyle: { color: '#6F5B99' },
  },
  line: {
    itemStyle: { borderWidth: 2 },
    lineStyle: { width: 3 },
    symbolSize: 6,
    symbol: 'circle',
  },
  radar: {
    itemStyle: { borderWidth: 2 },
    lineStyle: { width: 3 },
    symbolSize: 6,
    symbol: 'circle',
  },
  bar: {
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  },
  pie: {
    itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#E8DDF6' } },
    axisTick: { lineStyle: { color: '#E8DDF6' } },
    axisLabel: { color: '#6F5B99' },
    splitLine: { lineStyle: { color: '#E8DDF6' } },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: '#E8DDF6' } },
    axisTick: { lineStyle: { color: '#E8DDF6' } },
    axisLabel: { color: '#6F5B99' },
    splitLine: { lineStyle: { color: '#E8DDF6' } },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderColor: '#E8DDF6',
    textStyle: { color: '#25146F' },
  },
}
