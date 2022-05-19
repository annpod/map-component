import { roundNumber, checkIsNumber, calculateBoundingArea } from '../utils'
import { animateComponent } from '../animations'
import { handlePanningAnimation } from '../pan'
import { initialState } from '../InitialState'
import { checkZoomBounds, getComponentsSizes, getDelta, wheelMousePosition, handleCalculatePositions } from './utils'
import { StateProvider } from '../StateContext'
import { IStateProvider } from '../types'

// TODO - Review getTarget parameter.  Function is always called with undefined
function handleCalculateZoom(
  stateProviderInstance: StateProvider,
  delta: number,
  step: number,
  disablePadding: boolean | undefined,
  getTarget: undefined,
  isBtnFunction: boolean
) {
  const {
    scale,
    options: { maxScale, minScale },
    scalePadding: { size, disabled },
  } = stateProviderInstance.stateProvider

  let targetScale = null

  if (isBtnFunction) {
    const scaleFactor = window.innerWidth * 0.0001
    const zoomFactor = delta < 0 ? 30 : 20
    targetScale = scale + (step - step * scaleFactor) * delta * (scale / zoomFactor)
  } else {
    const wrapperToWindowScale = 1
    const scaleFactor = Math.max(0.2, Math.min(0.99, wrapperToWindowScale))

    const zoomFactor = 20
    targetScale = scale + step * delta * ((scale - scale * scaleFactor) / zoomFactor)
  }

  if (getTarget) return targetScale
  const paddingEnabled = disablePadding ? false : !disabled
  const newScale = checkZoomBounds(roundNumber(targetScale, 3), minScale, maxScale, size, paddingEnabled)
  return newScale
}

export function handleCalculateBounds(
  wrapperComponent: HTMLDivElement,
  contentComponent: HTMLDivElement,
  mapSize: IStateProvider['mapSize'],
  newScale: number
) {
  const { wrapperWidth, wrapperHeight, newContentWidth, newContentHeight } = getComponentsSizes(
    wrapperComponent,
    contentComponent,
    newScale
  )

  const bounds = calculateBoundingArea(
    wrapperWidth,
    newContentWidth,
    wrapperHeight,
    newContentHeight,
    newScale,
    mapSize
  )

  return bounds
}

/**
 * Wheel zoom event
 */
export function handleWheelZoom(stateProviderInstance: StateProvider, event: WheelEvent) {
  const {
    scale,
    wrapperComponent,
    contentComponent,
    mapSize,
    options: { limitToBounds },
    scalePadding: { size, disabled },
    wheel: { step, limitsOnWheel },
  } = stateProviderInstance.stateProvider

  event.preventDefault()
  event.stopPropagation()

  const delta = getDelta(event, null)
  const newScale = handleCalculateZoom(stateProviderInstance, delta, step, !event.ctrlKey, undefined, false)

  // if scale not change
  if (scale === newScale || !contentComponent || !wrapperComponent) return

  const bounds = handleCalculateBounds(wrapperComponent, contentComponent, mapSize, newScale)

  const { mouseX, mouseY } = wheelMousePosition(event, contentComponent, scale)

  const isLimitedToBounds = limitToBounds && (disabled || size === 0 || limitsOnWheel)

  const position = handleCalculatePositions(stateProviderInstance, mouseX, mouseY, newScale, bounds, isLimitedToBounds)

  if (!position) return

  if ('x' in position) {
    stateProviderInstance.bounds = bounds
    stateProviderInstance.stateProvider.previousScale = scale
    stateProviderInstance.stateProvider.scale = newScale
    stateProviderInstance.stateProvider.positionX = position.x
    stateProviderInstance.stateProvider.positionY = position.y
    stateProviderInstance.applyTransformation(null, null, null)
  }
}

/**
 * Zoom for animations
 */

// TODO - review event parameter, isn't passed when function is called
export function handleZoomToPoint(
  stateProviderInstance: StateProvider,
  isDisabled: boolean,
  scale: number,
  mouseX: number,
  mouseY: number,
  event?: WheelEvent
) {
  const {
    wrapperComponent,
    contentComponent,
    mapSize,
    options: { disabled, minScale, maxScale, limitToBounds },
  } = stateProviderInstance.stateProvider
  if (disabled || isDisabled || !contentComponent || !wrapperComponent) return

  const newScale = checkZoomBounds(roundNumber(scale, 2), minScale, maxScale, 0, false)
  const bounds = handleCalculateBounds(wrapperComponent, contentComponent, mapSize, newScale)

  let mousePosX = mouseX
  let mousePosY = mouseY

  // if event is present - use it's mouse position
  if (event) {
    const mousePosition = wheelMousePosition(event, contentComponent, scale)
    mousePosX = mousePosition.mouseX
    mousePosY = mousePosition.mouseY
  }

  const position = handleCalculatePositions(
    stateProviderInstance,
    mousePosX,
    mousePosY,
    newScale,
    bounds,
    limitToBounds
  )

  if (!position) return

  if ('x' in position) {
    return { scale: newScale, positionX: position.x, positionY: position.y }
  }
  return
}

export function handlePaddingAnimation(stateProviderInstance: StateProvider) {
  const {
    scale,
    wrapperComponent,
    options: { minScale, limitToBounds },
    scalePadding: { disabled, animationTime, animationType },
  } = stateProviderInstance.stateProvider
  const isDisabled = disabled || scale >= minScale

  if (scale >= 1 || limitToBounds) {
    // fire fit to bounds animation
    handlePanningAnimation(stateProviderInstance)
  }

  if (isDisabled || !wrapperComponent) return
  const mouseX = wrapperComponent.offsetWidth / 2
  const mouseY = wrapperComponent.offsetHeight / 2

  const targetState = handleZoomToPoint(stateProviderInstance, false, minScale, mouseX, mouseY)

  if (!targetState) {
    return
  }

  animateComponent(stateProviderInstance, {
    targetState,
    speed: animationTime,
    type: animationType,
  })
}

/**
 * Button zoom events
 */

export function handleDoubleClick(stateProviderInstance: StateProvider, event: MouseEvent) {
  event.preventDefault()
  event.stopPropagation()
  const {
    contentComponent,
    scale,
    doubleClick: { disabled, mode, step, animationTime, animationType },
  } = stateProviderInstance.stateProvider

  if (!contentComponent) {
    return
  }

  if (mode === 'reset') {
    return resetTransformations(stateProviderInstance)
  }
  const delta = mode === 'zoomOut' ? -1 : 1
  const newScale = handleCalculateZoom(stateProviderInstance, delta, step, undefined, undefined, true)

  const { mouseX, mouseY } = wheelMousePosition(event, contentComponent, scale)
  const targetState = handleZoomToPoint(stateProviderInstance, disabled, newScale, mouseX, mouseY)

  if (!targetState) {
    return
  }

  if (targetState.scale === scale) return
  const targetScale = handleCalculateZoom(stateProviderInstance, delta, step, true, undefined, true)
  const time = getButtonAnimationTime(targetScale, newScale, animationTime)

  animateComponent(stateProviderInstance, {
    targetState,
    speed: time,
    type: animationType,
  })
}

export function handleZoomControls(stateProviderInstance: StateProvider, customDelta: number, customStep: number) {
  const { scale, positionX, positionY, wrapperComponent, zoomIn, zoomOut } = stateProviderInstance.stateProvider

  if (!wrapperComponent) {
    return
  }

  const wrapperWidth = wrapperComponent.offsetWidth
  const wrapperHeight = wrapperComponent.offsetHeight
  const mouseX = (wrapperWidth / 2 - positionX) / scale
  const mouseY = (wrapperHeight / 2 - positionY) / scale

  const newScale = handleCalculateZoom(stateProviderInstance, customDelta, customStep, undefined, undefined, true)
  const isZoomIn = newScale > scale
  const animationSpeed = isZoomIn ? zoomIn.animationTime : zoomOut.animationTime
  const animationType = isZoomIn ? zoomIn.animationType : zoomOut.animationType
  const isDisabled = isZoomIn ? zoomIn.disabled : zoomOut.disabled

  const targetState = handleZoomToPoint(stateProviderInstance, isDisabled, newScale, mouseX, mouseY)

  if (!targetState) {
    return
  }

  if (targetState.scale === scale) return
  const targetScale = handleCalculateZoom(stateProviderInstance, customDelta, customStep, true, undefined, true)
  const time = getButtonAnimationTime(targetScale, newScale, animationSpeed)

  animateComponent(stateProviderInstance, {
    targetState,
    speed: time,
    type: animationType,
  })
}

export function resetTransformations(stateProviderInstance: StateProvider, animationSpeed?: number) {
  const defaultValues = stateProviderInstance.props.defaultValues
  const {
    scale,
    positionX,
    positionY,
    reset,
    wrapperComponent,
    contentComponent,
    mapSize,
    options: { disabled, limitToBounds, centerContent, limitToWrapper },
  } = stateProviderInstance.stateProvider
  if (disabled || reset.disabled) return
  if (scale === defaultValues.scale && positionX === defaultValues.positionX && positionY === defaultValues.positionY)
    return

  const speed = typeof animationSpeed === 'number' ? animationSpeed : reset.animationTime

  const targetScale = checkIsNumber(defaultValues.scale, initialState.scale)
  let newPositionX = checkIsNumber(defaultValues.positionX, initialState.positionX)
  let newPositionY = checkIsNumber(defaultValues.positionY, initialState.positionY)

  if (((limitToBounds && !limitToWrapper) || centerContent) && wrapperComponent && contentComponent) {
    const bounds = handleCalculateBounds(wrapperComponent, contentComponent, mapSize, targetScale)
    newPositionX = bounds.minPositionX
    newPositionY = bounds.minPositionY
  }

  const targetState = {
    scale: targetScale,
    positionX: newPositionX,
    positionY: newPositionY,
  }

  animateComponent(stateProviderInstance, {
    targetState,
    speed,
    type: reset.animationType,
  })
}

function getButtonAnimationTime(targetScale: number, newScale: number, time: number) {
  return time * (newScale / targetScale)
}
