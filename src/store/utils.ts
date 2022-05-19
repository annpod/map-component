import { MAP_WIDTH, MAP_HEIGHT } from '../constants'
import { DynamicValues, IStateProvider } from '../store/types'

/**
 * Rounds number to given decimal
 * eg. roundNumber(2.34343, 1) => 2.3
 */
export const roundNumber = (num: number, decimal: number) => {
  return Number(num.toFixed(decimal))
}

/**
 * Checks if value is number, if not it returns default value
 * 1# eg. checkIsNumber(2, 30) => 2
 * 2# eg. checkIsNumber(null, 30) => 30
 */
// TODO - Review as checkIsNumber param num is always a number
export const checkIsNumber = (num: number | null | undefined, defaultValue: number) => {
  return typeof num === 'number' ? num : defaultValue
}

/**
 * Keeps value between given bounds, used for limiting view to given boundaries
 * 1# eg. boundLimiter(2, 0, 3, true) => 2
 * 2# eg. boundLimiter(4, 0, 3, true) => 3
 * 3# eg. boundLimiter(-2, 0, 3, true) => 0
 * 4# eg. boundLimiter(10, 0, 3, false) => 10
 */
export const boundLimiter = (value: number, minBound: number, maxBound: number, isActive: boolean) => {
  if (!isActive) return roundNumber(value, 2)
  if (value < minBound) return roundNumber(minBound, 2)
  if (value > maxBound) return roundNumber(maxBound, 2)
  return roundNumber(value, 2)
}

/**
 * Calculate bounding area of zoomed/panned element
 */
export const calculateBoundingArea = (
  wrapperWidth: number,
  newContentWidth: number,
  wrapperHeight: number,
  newContentHeight: number,
  scale: number,
  mapSize: {
    mapPixelWidth: number
    mapPixelHeight: number
    ratio: number
    parentWidth: number
    mapHeight: number
  }
) => {
  const { ratio, parentWidth, mapHeight, mapPixelHeight, mapPixelWidth } = mapSize

  const xPadding = 20 * scale
  const yPadding = 20 * scale

  const xImagewhitespace = ((mapPixelWidth - MAP_WIDTH) / ratio / 2) * scale
  const xWhitespace = (parentWidth - wrapperWidth) / 2

  const minPositionX = -newContentWidth - xWhitespace - xImagewhitespace + xPadding
  const maxPositionX = wrapperWidth - xWhitespace - Math.abs(xImagewhitespace) - xPadding

  const yImageWhitespace = ((mapPixelHeight - MAP_HEIGHT) / ratio / 2) * scale
  const yHeadWhitespace = Math.abs((mapHeight - wrapperHeight) / 2)

  const minPositionY = -newContentHeight - yHeadWhitespace - yImageWhitespace + yPadding
  const maxPositionY = wrapperHeight - yHeadWhitespace - Math.abs(yImageWhitespace) - yPadding

  const bounds = { minPositionX, maxPositionX, minPositionY, maxPositionY }

  return bounds
}

/**
 * Returns distance between two points x,y
 */

type Point = {
  pageX: number
  pageY: number
}

export const getDistance = (firstPoint: Point | undefined, secondPoint: Point | undefined) => {
  return firstPoint && secondPoint
    ? Math.sqrt(Math.pow(firstPoint.pageX - secondPoint.pageX, 2) + Math.pow(firstPoint.pageY - secondPoint.pageY, 2))
    : 0
}

/**
 * Delete undefined values from object keys
 * Used for deleting empty props
 */
// TODO - Review Record<string, any> for a more narrow type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteUndefinedProps = (value: Record<string, any>) => {
  const newObject = { ...value }
  Object.keys(newObject).forEach((key) => newObject[key] === undefined && delete newObject[key])
  return newObject
}

/**
 * Fire callback if it's function
 */

// TODO - Cleanup: Check if is possible to replace this function with `callback && callback(props)`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleCallback = (callback: (p: Record<string, any>) => void, props: Record<string, any>) => {
  if (callback && typeof callback === 'function') {
    callback(props)
  }
}

export const handleWheelStop = (previousEvent: WheelEvent, event: WheelEvent, stateProvider: IStateProvider) => {
  const {
    scale,
    options: { maxScale, minScale },
  } = stateProvider
  if (!previousEvent) return false
  if (scale < maxScale || scale > minScale) return true
  if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY)) return true
  if (previousEvent.deltaY > 0 && previousEvent.deltaY < event.deltaY) return true
  if (previousEvent.deltaY < 0 && previousEvent.deltaY > event.deltaY) return true
  if (Math.sign(previousEvent.deltaY) !== Math.sign(event.deltaY)) return true
  return false
}

export const mergeProps = (initialState: IStateProvider, dynamicProps: DynamicValues) => {
  return Object.keys(initialState).reduce((acc, curr) => {
    if (typeof dynamicProps[curr] === 'object' && dynamicProps[curr] !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[curr] = { ...(initialState[curr] as object), ...dynamicProps[curr] }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[curr] = dynamicProps[curr] === undefined ? initialState[curr] : dynamicProps[curr]
    }
    return acc
  }, {})
}

export function getWindowScaleY(wrapper: HTMLDivElement) {
  if (!wrapper) return 0
  return window.innerHeight / wrapper.offsetHeight
}

export function getWindowScaleX(wrapper: HTMLDivElement) {
  if (!wrapper) return 0
  return window.innerWidth / wrapper.offsetWidth
}

export function isTouchEvent(e: TouchEvent | MouseEvent): e is TouchEvent {
  return e && 'touches' in e
}

export function isMouseEvent(e: TouchEvent | MouseEvent): e is MouseEvent {
  return e && 'screenX' in e
}
