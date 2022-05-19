import { getClientPosition, handlePanningAnimation } from '../pan'
import { checkPositionBounds } from '../zoom/utils'
import { boundLimiter } from '../utils'
import { animate, handleDisableAnimation } from '../animations'
import { availableAnimations } from '../animations/utils'
import { StateProvider } from '../StateContext'

const throttleTime = 30

function velocityTimeSpeed(stateProviderInstance: StateProvider, speed: number, animationTime: number) {
  const {
    pan: { velocityEqualToMove },
  } = stateProviderInstance.stateProvider

  if (velocityEqualToMove) {
    return animationTime - animationTime / Math.max(1, speed)
  }
  return animationTime
}

// TODO - Review this function, state.startAnimation is not used
function handleEnableVelocity(stateProviderInstance: StateProvider) {
  stateProviderInstance.setState({ startAnimation: false })
}
// TODO - Review this function, state.startAnimation is not used
export function handleFireVelocity(stateProviderInstance: StateProvider) {
  stateProviderInstance.setState({ startAnimation: true })
}

export function animateVelocity(stateProviderInstance: StateProvider) {
  const {
    positionX,
    positionY,
    options: { limitToBounds },
    pan: {
      velocityBaseTime,
      lockAxisX,
      lockAxisY,
      velocityAnimationType,
      panReturnAnimationTime,
      panReturnAnimationType,
      padding,
      paddingSize,
    },
    wrapperComponent,
  } = stateProviderInstance.stateProvider
  if (!stateProviderInstance.mounted) return
  if (!stateProviderInstance.velocity || !stateProviderInstance.bounds)
    return handleDisableAnimation(stateProviderInstance)
  if (!wrapperComponent) return

  if (
    !('maxPositionX' in stateProviderInstance.bounds) ||
    typeof stateProviderInstance.velocity === 'boolean' ||
    !('velocityX' in stateProviderInstance.velocity)
  )
    return

  const { maxPositionX, minPositionX, maxPositionY, minPositionY } = stateProviderInstance.bounds

  if (!maxPositionX || !minPositionX || !maxPositionY || !minPositionY) return

  const { velocityX, velocityY, velocity } = stateProviderInstance.velocity
  const animationTime = velocityTimeSpeed(stateProviderInstance, velocity, velocityBaseTime)

  if (!animationTime) {
    handlePanningAnimation(stateProviderInstance)
    return
  }

  const targetX = velocityX
  const targetY = velocityY

  // pan return animation
  const newAnimationTime = animationTime > panReturnAnimationTime ? animationTime : panReturnAnimationTime

  const paddingValue = padding ? paddingSize : 0

  const paddingX = wrapperComponent ? (paddingValue * wrapperComponent.offsetWidth) / 100 : 0
  const paddingY = wrapperComponent ? (paddingValue * wrapperComponent.offsetHeight) / 100 : 0

  const maxTargetX = maxPositionX + paddingX
  const minTargetX = minPositionX - paddingX

  const maxTargetY = maxPositionY + paddingY
  const minTargetY = minPositionY - paddingY

  const startPosition = checkPositionBounds(
    positionX,
    positionY,
    { maxPositionX, minPositionX, maxPositionY, minPositionY },
    limitToBounds,
    paddingValue,
    wrapperComponent
  )

  const startTime = new Date().getTime()

  // animation start timestamp
  animate(stateProviderInstance, velocityAnimationType, newAnimationTime, (step: number) => {
    const frameTime = new Date().getTime() - startTime
    const animationProgress = frameTime / panReturnAnimationTime
    const returnAnimation = availableAnimations[panReturnAnimationType] as (t: number) => number

    let customReturnStep = returnAnimation(animationProgress)

    if (
      frameTime > panReturnAnimationTime ||
      customReturnStep > 1 ||
      customReturnStep === Infinity ||
      customReturnStep === -Infinity
    )
      customReturnStep = 1

    const currentPositionX = getPosition(
      lockAxisX,
      targetX,
      step,
      customReturnStep,
      minPositionX,
      maxPositionX,
      limitToBounds,
      positionX,
      startPosition.x,
      minTargetX,
      maxTargetX
    )
    const currentPositionY = getPosition(
      lockAxisY,
      targetY,
      step,
      customReturnStep,
      minPositionY,
      maxPositionY,
      limitToBounds,
      positionY,
      startPosition.y,
      minTargetY,
      maxTargetY
    )

    if (positionX !== currentPositionX || positionY !== currentPositionY) {
      // Save panned position
      stateProviderInstance.stateProvider.positionX = currentPositionX
      stateProviderInstance.stateProvider.positionY = currentPositionY

      // apply animation changes
      stateProviderInstance.applyTransformation(null, null, null)
    }
  })
}

export function calculateVelocityStart(stateProviderInstance: StateProvider, event: TouchEvent | MouseEvent) {
  const {
    scale,
    options: { disabled },
    pan: { velocity, velocitySensitivity, velocityActiveScale, velocityMinSpeed },
    wrapperComponent,
  } = stateProviderInstance.stateProvider

  if (!velocity || velocityActiveScale >= scale || disabled) return
  handleEnableVelocity(stateProviderInstance)
  const now = Date.now()
  if (stateProviderInstance.lastMousePosition) {
    const position = getClientPosition(event)
    if (!position) return console.error('No mouse or touch position detected')
    if (!wrapperComponent) return

    if (
      !stateProviderInstance.lastMousePosition ||
      typeof stateProviderInstance.lastMousePosition === 'number' ||
      stateProviderInstance.velocityTime === null
    )
      return

    const { clientX, clientY } = position
    const distanceX = clientX - stateProviderInstance.lastMousePosition.clientX
    const distanceY = clientY - stateProviderInstance.lastMousePosition.clientY

    const interval = now - stateProviderInstance.velocityTime

    const wrapperToWindowScaleX = 2 - wrapperComponent.offsetWidth / window.innerWidth
    const wrapperToWindowScaleY = 2 - wrapperComponent.offsetHeight / window.innerHeight

    const scaledX = 20 * Math.max(velocityMinSpeed, Math.min(2, wrapperToWindowScaleX))
    const scaledY = 20 * Math.max(velocityMinSpeed, Math.min(2, wrapperToWindowScaleY))

    const velocityX = (distanceX / interval) * velocitySensitivity * scale * scaledX
    const velocityY = (distanceY / interval) * velocitySensitivity * scale * scaledY

    const speed = distanceX * distanceX + distanceY * distanceY
    const velocity = (Math.sqrt(speed) / interval) * velocitySensitivity

    if (stateProviderInstance.velocity !== null && typeof stateProviderInstance.velocity === 'object') {
      if (velocity < stateProviderInstance.velocity.velocity && stateProviderInstance.throttle) return
    }

    stateProviderInstance.velocity = { velocityX, velocityY, velocity }

    // throttling
    if (stateProviderInstance.throttle && typeof stateProviderInstance.throttle !== 'boolean')
      clearTimeout(stateProviderInstance.throttle)
    stateProviderInstance.throttle = setTimeout(() => {
      if (stateProviderInstance.mounted) stateProviderInstance.throttle = false
    }, throttleTime)
  }
  const position = getClientPosition(event)
  stateProviderInstance.lastMousePosition = position
  stateProviderInstance.velocityTime = now
}

function getPosition(
  isLocked: boolean,
  target: number,
  step: number,
  panReturnStep: number,
  minBound: number,
  maxBound: number,
  limitToBounds: boolean,
  offset: number,
  startPosition: number,
  minTarget: number,
  maxTarget: number
) {
  if (limitToBounds) {
    if (startPosition > minBound && offset > maxBound) {
      const newPosition = startPosition - (startPosition - maxBound) * panReturnStep
      if (newPosition > maxTarget) return maxTarget
      if (newPosition < maxBound) return maxBound
      return newPosition
    }
    if (startPosition < minBound && offset < minBound) {
      const newPosition = startPosition - (startPosition - minBound) * panReturnStep
      if (newPosition < minTarget) return minTarget
      if (newPosition > minBound) return minBound
      return newPosition
    }
  }
  if (isLocked) return startPosition
  const offsetPosition = offset + target * step
  return boundLimiter(offsetPosition, minBound, maxBound, limitToBounds)
}
