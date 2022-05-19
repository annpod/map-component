import { boundLimiter, checkIsNumber } from '../utils'
import { Bounds } from '../types'
import { StateProvider } from '../StateContext'

export function checkZoomBounds(
  zoom: number,
  minScale: number,
  maxScale: number,
  zoomPadding: number,
  enablePadding: boolean
) {
  const scalePadding = enablePadding ? zoomPadding : 0
  const minScaleWithPadding = minScale - scalePadding

  if (!isNaN(maxScale) && zoom >= maxScale) return maxScale
  if (!isNaN(minScale) && zoom <= minScaleWithPadding) return minScaleWithPadding
  return zoom
}

export function checkPositionBounds(
  positionX: number,
  positionY: number,
  bounds: Bounds,
  limitToBounds: boolean,
  paddingValue: number,
  wrapperComponent?: HTMLDivElement
) {
  const { minPositionX, minPositionY, maxPositionX, maxPositionY } = bounds
  const paddingX = wrapperComponent ? (paddingValue * wrapperComponent.offsetWidth) / 100 : 0
  const paddingY = wrapperComponent ? (paddingValue * wrapperComponent.offsetHeight) / 100 : 0

  const x = boundLimiter(positionX, minPositionX - paddingX, maxPositionX + paddingX, limitToBounds)

  const y = boundLimiter(positionY, minPositionY - paddingY, maxPositionY + paddingY, limitToBounds)
  return { x, y }
}

// TODO - Review getDelta as only called once and with null as customDelta param.
// <customDelta: any> is correct as checkNumber is type <any>
export function getDelta(event: WheelEvent, customDelta: number | null) {
  const deltaY = event ? (event.deltaY < 0 ? 1 : -1) : 0
  const delta = checkIsNumber(customDelta, deltaY)
  return delta
}

export function wheelMousePosition(
  event: MouseEvent,
  contentComponent: HTMLDivElement,
  scale: number
): { mouseX: number; mouseY: number } {
  const contentRect = contentComponent.getBoundingClientRect()

  // mouse position x, y over wrapper component
  const mouseX = (event.clientX - contentRect.left) / scale
  const mouseY = (event.clientY - contentRect.top) / scale

  if (isNaN(mouseX) || isNaN(mouseY)) console.error('No mouse or touch offset found')

  return {
    mouseX,
    mouseY,
  }
}

export function getComponentsSizes(
  wrapperComponent: HTMLDivElement,
  contentComponent: HTMLDivElement,
  newScale: number
) {
  const wrapperWidth = wrapperComponent.offsetWidth
  const wrapperHeight = wrapperComponent.offsetHeight

  const contentWidth = contentComponent.offsetWidth
  const contentHeight = contentComponent.offsetHeight

  const newContentWidth = contentWidth * newScale
  const newContentHeight = contentHeight * newScale

  return {
    wrapperWidth,
    wrapperHeight,
    newContentWidth,
    newContentHeight,
  }
}

// TODO - Review this function and references as return type can be multiple types.
export function handleCalculatePositions(
  stateProviderInstance: StateProvider,
  mouseX: number,
  mouseY: number,
  newScale: number,
  bounds: Bounds,
  limitToBounds: boolean
): { x: number; y: number } | { newPositionX: number; newPositionY: number } | void {
  const {
    scale,
    positionX,
    positionY,
    options: { transformEnabled },
  } = stateProviderInstance.stateProvider

  const scaleDifference = newScale - scale

  if (typeof mouseX !== 'number' || typeof mouseY !== 'number')
    return console.error('Mouse X and Y position were not provided!')

  if (!transformEnabled) return { newPositionX: positionX, newPositionY: positionY }

  const calculatedPositionX = positionX - mouseX * scaleDifference
  const calculatedPositionY = positionY - mouseY * scaleDifference

  // do not limit to bounds when there is padding animation,
  // it causes animation strange behaviour

  const newPositions = checkPositionBounds(calculatedPositionX, calculatedPositionY, bounds, limitToBounds, 0)

  return newPositions
}
