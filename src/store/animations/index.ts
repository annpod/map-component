import { availableAnimations } from './utils'
import { StateProvider } from '../StateContext'

export const handleDisableAnimation = (stateProviderInstance: StateProvider) => {
  if (!stateProviderInstance.mounted) return
  if (stateProviderInstance.animation && typeof stateProviderInstance.animation === 'number') {
    cancelAnimationFrame(stateProviderInstance.animation)
  }
  stateProviderInstance.animate = false
  stateProviderInstance.animation = false
  stateProviderInstance.velocity = false
}

export function animate(
  stateProviderInstance: StateProvider,
  animationName: string,
  animationTime: number,
  callback: (args: number) => void
) {
  if (!stateProviderInstance.mounted) return
  const startTime = new Date().getTime()
  const lastStep = 1

  // if another animation is active
  handleDisableAnimation(stateProviderInstance)

  // new animation
  stateProviderInstance.animation = () => {
    if (!stateProviderInstance.animation || !stateProviderInstance.mounted) return
    const frameTime = new Date().getTime() - startTime
    const animationProgress = frameTime / animationTime
    const animationType = availableAnimations[animationName] as (t: number) => number

    const step = animationType(animationProgress)

    if (frameTime >= animationTime) {
      callback(lastStep)
      stateProviderInstance.animation = null
    } else {
      callback(step)
      if (typeof stateProviderInstance.animation !== 'boolean') requestAnimationFrame(stateProviderInstance.animation)
    }
  }

  requestAnimationFrame(stateProviderInstance.animation)
}

interface TargetState {
  scale: number
  positionX: number
  positionY: number
}

export function animateComponent(
  stateProviderInstance: StateProvider,
  {
    targetState,
    speed,
    type,
  }: {
    targetState: TargetState
    speed: number
    type: string
  }
) {
  const { scale, positionX, positionY } = stateProviderInstance.stateProvider

  const scaleDiff = targetState.scale - scale
  const positionXDiff = targetState.positionX - positionX
  const positionYDiff = targetState.positionY - positionY

  if (speed === 0) {
    stateProviderInstance.stateProvider.previousScale = stateProviderInstance.stateProvider.scale
    stateProviderInstance.stateProvider.scale = targetState.scale
    stateProviderInstance.stateProvider.positionX = targetState.positionX
    stateProviderInstance.stateProvider.positionY = targetState.positionY
    stateProviderInstance.applyTransformation(null, null, null)
  } else {
    // animation start timestamp
    animate(stateProviderInstance, type, speed, (step: number) => {
      stateProviderInstance.stateProvider.previousScale = stateProviderInstance.stateProvider.scale
      stateProviderInstance.stateProvider.scale = scale + scaleDiff * step
      stateProviderInstance.stateProvider.positionX = positionX + positionXDiff * step
      stateProviderInstance.stateProvider.positionY = positionY + positionYDiff * step

      // apply animation changes
      stateProviderInstance.applyTransformation(null, null, null)
    })
  }
}
