import { checkZoomBounds, handleCalculatePositions } from '../zoom/utils'
import { handleCalculateBounds } from '../zoom'
import { getDistance, roundNumber } from '../utils'
import { IStateProvider } from '../types'
import { StateProvider } from '../StateContext'

function round(number: number, decimal: number) {
  const roundNumber = Math.pow(10, decimal)
  return Math.round(number * roundNumber) / roundNumber
}

function getCurrentDistance(event: TouchEvent) {
  return getDistance(event.touches[0], event.touches[1])
}

function checkIfInfinite(number: number) {
  return number === Infinity || number === -Infinity
}

export function calculatePinchZoom(
  stateProviderInstance: StateProvider,
  currentDistance: number,
  pinchStartDistance: number
) {
  const {
    options: { minScale, maxScale },
    scalePadding: { size, disabled },
  }: IStateProvider = stateProviderInstance.stateProvider
  if (
    typeof pinchStartDistance !== 'number' ||
    typeof currentDistance !== 'number' ||
    typeof stateProviderInstance.pinchStartScale !== 'number'
  ) {
    return console.error('Pinch touches distance was not provided')
  }

  if (currentDistance < 0) return
  const touchProportion = currentDistance / pinchStartDistance
  const scaleDifference = touchProportion * stateProviderInstance.pinchStartScale

  return checkZoomBounds(roundNumber(scaleDifference, 2), minScale, maxScale, size, !disabled)
}

export function calculateMidpoint(event: TouchEvent, scale: number, contentComponent: HTMLDivElement) {
  const contentRect = contentComponent.getBoundingClientRect()
  const { touches } = event
  const firstPointX = round((touches[0]?.clientX || 0) - contentRect.left, 5)
  const firstPointY = round(touches[0]?.clientY || 0 - contentRect.top, 5)
  const secondPointX = round(touches[1]?.clientX || 0 - contentRect.left, 5)
  const secondPointY = round(touches[1]?.clientY || 0 - contentRect.top, 5)

  return {
    mouseX: (firstPointX + secondPointX) / 2 / scale,
    mouseY: (firstPointY + secondPointY) / 2 / scale,
  }
}

export function handleZoomPinch(stateProviderInstance: StateProvider, event: TouchEvent) {
  const {
    scale,
    wrapperComponent,
    contentComponent,
    mapSize,
    options: { limitToBounds },
    scalePadding: { disabled, size },
    wheel: { limitsOnWheel },
    pinch,
  } = stateProviderInstance.stateProvider
  if (pinch.disabled || stateProviderInstance.stateProvider.options.disabled) return

  if (event.cancelable) {
    event.preventDefault()
    event.stopPropagation()
  }

  // if one finger starts from outside of wrapper
  if (stateProviderInstance.pinchStartDistance === null) return
  if (!contentComponent || !wrapperComponent) return

  // Position transformation
  const { mouseX, mouseY } = calculateMidpoint(event, scale, contentComponent)

  // if touches goes off of the wrapper element
  if (checkIfInfinite(mouseX) || checkIfInfinite(mouseY)) return

  const currentDistance = getCurrentDistance(event)

  const newScale = calculatePinchZoom(stateProviderInstance, currentDistance, stateProviderInstance.pinchStartDistance)

  if (!newScale || checkIfInfinite(newScale) || newScale === scale) return

  // Get new element sizes to calculate bounds
  const bounds = handleCalculateBounds(wrapperComponent, contentComponent, mapSize, newScale)

  stateProviderInstance.bounds = bounds

  // Calculate transformations
  const isLimitedToBounds = limitToBounds && (disabled || size === 0 || limitsOnWheel)

  const position = handleCalculatePositions(stateProviderInstance, mouseX, mouseY, newScale, bounds, isLimitedToBounds)

  stateProviderInstance.lastDistance = currentDistance

  if (!position) return

  if ('x' in position) {
    stateProviderInstance.stateProvider.positionX = position.x
    stateProviderInstance.stateProvider.positionY = position.y
    stateProviderInstance.stateProvider.scale = newScale
    stateProviderInstance.stateProvider.previousScale = scale
  }

  // update component transformation
  stateProviderInstance.applyTransformation(null, null, null)
}
