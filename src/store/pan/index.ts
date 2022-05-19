import { checkPositionBounds, handleCalculatePositions } from '../zoom/utils'
import { animateComponent } from '../animations'
import { isTouchEvent, isMouseEvent } from '../utils'
import { IStateProvider } from '../types'
import { StateProvider } from '../StateContext'

export function getClientPosition(event: TouchEvent | MouseEvent) {
  // Mobile points
  if (isTouchEvent(event)) {
    const { touches } = event
    if (touches && touches[0]) {
      return { clientX: touches[0].clientX, clientY: touches[0].clientY }
    }
  }

  // Desktop points
  if (isMouseEvent(event)) {
    return { clientX: event.clientX, clientY: event.clientY }
  }

  return null
}

export function handlePanning(stateProviderInstance: StateProvider, event: TouchEvent | MouseEvent) {
  const {
    scale,
    positionX,
    positionY,
    options: { limitToBounds, minScale },
    pan: { lockAxisX, lockAxisY, padding, paddingSize },
    wrapperComponent,
  } = stateProviderInstance.stateProvider

  if (!stateProviderInstance.startCoords || !wrapperComponent) return
  const { x, y } = stateProviderInstance.startCoords

  const positions = getClientPosition(event)
  if (!positions) return console.error('Cannot find mouse client positions')
  const { clientX, clientY } = positions

  // Get Position
  const mouseX = clientX - x
  const mouseY = clientY - y
  const newPositionX = lockAxisX ? positionX : mouseX
  const newPositionY = lockAxisY ? positionY : mouseY

  // padding
  const paddingValue = padding && scale >= minScale ? paddingSize : 0

  // If position didn't change
  if (newPositionX === positionX && newPositionY === positionY) return

  const { maxPositionX, minPositionX, maxPositionY, minPositionY } = stateProviderInstance.bounds

  if (!maxPositionX || !minPositionX || !maxPositionY || !minPositionY) return

  const calculatedPosition = checkPositionBounds(
    newPositionX,
    newPositionY,
    { maxPositionX, minPositionX, maxPositionY, minPositionY },
    limitToBounds,
    paddingValue,
    wrapperComponent
  )

  // Save panned position
  handlePaddingAnimation(stateProviderInstance, calculatedPosition.x, calculatedPosition.y)
}

export function handlePanningAnimation(stateProviderInstance: StateProvider) {
  const {
    scale,
    options: { minScale },
    pan: { disabled, padding, panReturnAnimationTime, panReturnAnimationType },
  } = stateProviderInstance.stateProvider
  const isDisabled = disabled || scale < minScale || !padding

  if (isDisabled) return

  const targetState = handlePanToBounds(stateProviderInstance)

  if (!targetState) {
    return
  }

  animateComponent(stateProviderInstance, {
    targetState,
    speed: panReturnAnimationTime,
    type: panReturnAnimationType,
  })
}

export function handlePanToBounds(stateProviderInstance: StateProvider) {
  const {
    positionX,
    positionY,
    scale,
    options: { disabled, limitToBounds, limitToWrapper },
  } = stateProviderInstance.stateProvider
  const { wrapperComponent } = stateProviderInstance.state
  if (disabled) return
  if (!('maxPositionX' in stateProviderInstance.bounds)) return
  if (!wrapperComponent) return
  const { maxPositionX, minPositionX, maxPositionY, minPositionY } = stateProviderInstance.bounds

  if (!maxPositionX || !minPositionX || !maxPositionY || !minPositionY) return

  const xChanged = positionX > maxPositionX || positionX < minPositionX
  const yChanged = positionY > maxPositionY || positionY < minPositionY

  const mouseX = positionX > maxPositionX ? wrapperComponent.offsetWidth : 0
  const mouseY = positionY > maxPositionY ? wrapperComponent.offsetHeight : 0

  const mousePosX = mouseX
  const mousePosY = mouseY

  const position = handleCalculatePositions(
    stateProviderInstance,
    mousePosX,
    mousePosY,
    scale,
    { maxPositionX, minPositionX, maxPositionY, minPositionY },
    limitToBounds || limitToWrapper
  )

  if (!position) return

  if ('x' in position) {
    return {
      scale,
      positionX: xChanged ? position.x : positionX,
      positionY: yChanged ? position.y : positionY,
    }
  }
  return
}

function handlePaddingAnimation(stateProviderInstance: StateProvider, positionX: number, positionY: number) {
  const {
    pan: { padding },
  }: IStateProvider = stateProviderInstance.stateProvider
  if (!padding) return
  stateProviderInstance.stateProvider.positionX = positionX
  stateProviderInstance.stateProvider.positionY = positionY
  stateProviderInstance.applyTransformation(null, null, null)
}
