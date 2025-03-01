import { readParam } from '@/composables/useReplaceUrl'
import { mediaAbsoluteDeviation, median } from '@/utils/math'

export type DataPoint = {
  timestamp: number
  value: number
}

export interface BinSize {
  weeks?: number
  days?: number
  hours?: number
  minutes?: number
}

export const toDataPoint = (e: {
  timestamp: number
  meta: string
}): DataPoint => ({
  timestamp: e.timestamp,
  value: parseInt(e.meta),
})

export const sortAsc = (events: DataPoint[]) =>
  events.sort((a, b) => a.timestamp - b.timestamp)

export const displayValue = (val: number, decimals: number) =>
  Number((val * Math.pow(10, -1 * decimals)).toFixed(4))

const binSizeToMillis = (binSize: BinSize): number => {
  const millisInMinute = 60 * 1000
  const millisInHour = 60 * millisInMinute
  const millisInDay = 24 * millisInHour
  const millisInWeek = 7 * millisInDay

  const millis =
    (binSize.weeks ?? 0) * millisInWeek +
    (binSize.days ?? 0) * millisInDay +
    (binSize.hours ?? 0) * millisInHour +
    (binSize.minutes ?? 0) * millisInMinute

  return millis || millisInDay // Default bin size is one day
}

function millisToBinSize(millis: number): BinSize {
  const minuteMillis = 60000
  const hourMillis = 60 * minuteMillis
  const dayMillis = 24 * hourMillis
  const weekMillis = 7 * dayMillis

  const weeks = Math.floor(millis / weekMillis)
  millis -= weeks * weekMillis

  const days = Math.floor(millis / dayMillis)
  millis -= days * dayMillis

  const hours = Math.floor(millis / hourMillis)
  millis -= hours * hourMillis

  const minutes = Math.ceil(millis / minuteMillis)

  return {
    weeks: weeks || undefined,
    days: days || undefined,
    hours: hours || undefined,
    minutes: minutes || undefined,
  }
}

export const getBinSizeForRange = ({
  timestamps,
  sampleRate = 2,
  sort = false,
}: {
  timestamps: number[]
  sampleRate?: number
  sort?: boolean
}): BinSize => {
  if (timestamps.length < 2) {
    return { minutes: 1 }
  }

  const minTimestamp = sort ? Math.min(...timestamps) : timestamps[0]
  const maxTimestamp = sort
    ? Math.max(...timestamps)
    : timestamps[timestamps.length - 1]

  const totalMillis = maxTimestamp - minTimestamp
  const idealBinSizeMillis = totalMillis / (timestamps.length * sampleRate)

  return millisToBinSize(idealBinSizeMillis)
}

const mean = (arr: DataPoint[]): number => {
  const sum = arr.reduce((total, { value }) => total + value, 0)
  return sum / arr.length
}

export const isAnyActivityFilterActive = (): boolean => {
  const query = useRoute().query

  return (
    readParam(query?.sale) ||
    readParam(query?.listing) ||
    readParam(query?.mint) ||
    readParam(query?.transfer) ||
    readParam(query?.offer)
  )
}

export const bin = (data: DataPoint[], binSize: BinSize): DataPoint[] => {
  if (data.length < 2) {
    return data
  }
  const binSizeMillis = binSizeToMillis(binSize)

  const firstTimestamp = data[0].timestamp
  const lastTimestamp = data[data.length - 1].timestamp

  const numBins = Math.ceil((lastTimestamp - firstTimestamp) / binSizeMillis)
  if (numBins === 0) {
    return data
  }
  const bins = new Array(numBins).fill(null).map((_, index) => {
    const binStart = firstTimestamp + index * binSizeMillis
    const binEnd = binStart + binSizeMillis
    const binData = data.filter(
      (dataPoint) =>
        dataPoint.timestamp >= binStart && dataPoint.timestamp < binEnd,
    )
    return { timestamp: binStart + binSizeMillis / 2, value: mean(binData) }
  })

  return bins.filter((bin) => !isNaN(bin.value))
}

export const format = (number: number) => {
  const isInteger = Number.isInteger(number)
  return isInteger ? number.toString() : number.toFixed(4)
}

export const removeOutliers = (
  data: DataPoint[],
  outlierThresholdScale = 0.75,
): DataPoint[] => {
  const values = data.map((d) => d.value)
  const med = median(values)
  const medianAbsDev = mediaAbsoluteDeviation(values)
  const THRESHOLD = med + outlierThresholdScale * medianAbsDev

  return data.filter(({ value }) => {
    const deviation = Math.abs(value - med)

    return deviation < THRESHOLD
  })
}
