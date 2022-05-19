import React, { Component } from 'react'
import { initialState } from './InitialState'
import {
  mergeProps,
  getDistance,
  handleCallback,
  handleWheelStop,
  getWindowScaleX,
  getWindowScaleY,
  isTouchEvent,
} from './utils'
import {
  handleZoomControls,
  handleDoubleClick,
  resetTransformations,
  handlePaddingAnimation,
  handleWheelZoom,
  handleCalculateBounds,
} from './zoom'
import { handleDisableAnimation, animateComponent } from './animations'
import { handleZoomPinch } from './pinch'
import { handlePanning, handlePanningAnimation } from './pan'
import { handleFireVelocity, animateVelocity, calculateVelocityStart } from './velocity'
import makePassiveEventOption from './makePassiveEventOption'
import {
  StateContextState,
  StateContextProps,
  IStateProvider,
  Bounds,
  Velocity,
  LastMousePosition,
  Animation,
  ContextShape,
} from '../store/types'
import { getValidPropsFromObject } from './propsHandlers'

const Context = React.createContext<ContextShape>({} as ContextShape)

type ISetTimeoutId = ReturnType<typeof setTimeout> | null
type ISetIntervalId = ReturnType<typeof setInterval> | null

let wheelStopEventTimer: ISetTimeoutId = null
const wheelStopEventTime = 180
let wheelAnimationTimer: ISetTimeoutId = null
const wheelAnimationTime = 100

class StateProvider extends Component<StateContextProps, StateContextState> {
  public mounted = true

  public state: StateContextState = {
    wrapperComponent: undefined,
    contentComponent: undefined,
    startAnimation: false,
  }

  public stateProvider: IStateProvider = {
    ...initialState,
    ...mergeProps(initialState, this.props.dynamicValues),
    ...this.props.defaultValues,
    previousScale: this.props.dynamicValues.scale || this.props.defaultValues.scale || initialState.scale,
  }

  public windowToWrapperScaleX = 0
  public windowToWrapperScaleY = 0
  // panning helpers
  public startCoords: { x: number; y: number } | null = null
  public isDown = false
  // pinch helpers
  public pinchStartDistance: number | null = null
  public lastDistance: number | null = null
  public pinchStartScale: number | null = null
  public distance: number | null = null
  public bounds: Partial<Bounds> = {}
  // velocity helpers
  public velocityTime: number | null = null
  public lastMousePosition: LastMousePosition = null
  public velocity: Velocity = null
  public offsetX: number | null = null
  public offsetY: number | null = null
  public throttle: ISetTimeoutId | boolean = false
  // wheel helpers
  public previousWheelEvent: WheelEvent | null = null
  public lastScale: number | null = null
  // animations helpers
  public animate: boolean | null = null
  public animation: Animation = null

  componentDidMount() {
    const passiveOption = makePassiveEventOption(false)

    // Panning on window to allow panning when mouse is out of wrapper
    window.addEventListener('mousedown', this.handleStartPanning, passiveOption)
    window.addEventListener('mousemove', this.handlePanning, passiveOption)
    window.addEventListener('mouseup', this.handleStopPanning, passiveOption)
  }

  componentWillUnmount() {
    window.removeEventListener('mousedown', this.handleStartPanning)
    window.removeEventListener('mousemove', this.handlePanning)
    window.removeEventListener('mouseup', this.handleStopPanning)
    handleDisableAnimation(this)
    this.mounted = false
  }

  componentDidUpdate(oldProps: StateContextProps, oldState: StateContextState) {
    const { wrapperComponent, contentComponent } = this.state
    const { dynamicValues } = this.props
    if (!oldState.contentComponent && contentComponent) {
      this.stateProvider.contentComponent = contentComponent
    }
    if (!oldState.wrapperComponent && wrapperComponent && wrapperComponent !== undefined) {
      this.stateProvider.wrapperComponent = wrapperComponent
      this.windowToWrapperScaleX = getWindowScaleX(wrapperComponent)
      this.windowToWrapperScaleY = getWindowScaleY(wrapperComponent)

      // TODO - Review the mobile event listeners, should they be moved to componentDidMount?
      // Zooming events on wrapper
      const passiveOption = makePassiveEventOption(false)
      wrapperComponent.addEventListener('wheel', this.handleWheel, passiveOption)
      wrapperComponent.addEventListener('dblclick', this.handleDbClick, passiveOption)
      wrapperComponent.addEventListener('touchstart', this.handleTouchStart, passiveOption)
      wrapperComponent.addEventListener('touchmove', this.handleTouch, passiveOption)
      wrapperComponent.addEventListener('touchend', this.handleTouchStop, passiveOption)
    }

    // must be at the end of the update function, updates
    if (oldProps.dynamicValues && oldProps.dynamicValues !== dynamicValues) {
      this.animation = null
      this.stateProvider = {
        ...this.stateProvider,
        ...mergeProps(this.stateProvider, dynamicValues),
      }
      this.applyTransformation(null, null, null)
    }
  }

  //////////
  // Wheel
  //////////

  handleWheel = (event: WheelEvent) => {
    const {
      scale,
      wheel: { disabled, wheelEnabled, touchPadEnabled },
    } = this.stateProvider

    const { onWheelStart, onWheel, onWheelStop } = this.props
    const { wrapperComponent, contentComponent } = this.state

    if (this.isDown || disabled || this.stateProvider.options.disabled || !wrapperComponent || !contentComponent) return

    // ctrlKey detects if touchpad execute wheel or pinch gesture
    if (!wheelEnabled && !event.ctrlKey) return
    if (!touchPadEnabled && event.ctrlKey) return

    // Wheel start event
    if (!wheelStopEventTimer) {
      this.lastScale = scale
      handleDisableAnimation(this)
      onWheelStart && handleCallback(onWheelStart, this.getCallbackProps())
    }

    // Wheel event
    handleWheelZoom(this, event)
    onWheel && handleCallback(onWheel, this.getCallbackProps())
    this.applyTransformation(null, null, null)
    this.previousWheelEvent = event

    // Wheel stop event
    if (handleWheelStop(this.previousWheelEvent, event, this.stateProvider)) {
      wheelStopEventTimer && clearTimeout(wheelStopEventTimer)
      wheelStopEventTimer = setTimeout(() => {
        if (!this.mounted) return
        onWheelStop && handleCallback(onWheelStop, this.getCallbackProps())
        wheelStopEventTimer = null
      }, wheelStopEventTime)
    }

    // cancel animation
    this.animate = false

    // fire animation
    this.lastScale = this.stateProvider.scale
    wheelAnimationTimer && clearTimeout(wheelAnimationTimer)
    wheelAnimationTimer = setTimeout(() => {
      if (!this.mounted) return
      handlePaddingAnimation(this)
    }, wheelAnimationTime)
  }

  //////////
  // Panning
  //////////

  // TODO - This function doesn't work. The property path event.target.classList of either TouchEvent | MouseEvent event isn't available, type any until I can refactor this function.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  checkPanningTarget = (event: any) => {
    const {
      pan: { disableOnTarget },
    } = this.stateProvider
    // TODO - review this, doesn't work
    /* eslint-disable */
    return (
      disableOnTarget.map((tag: string) => tag.toUpperCase()).includes(event.target.tagName) ||
      disableOnTarget.find((element: string) => event.target.classList.value.includes(element))
    )
  }

  checkIsPanningActive = (event: MouseEvent | TouchEvent) => {
    const {
      pan: { disabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state

    if (!this.isDown || disabled || this.stateProvider.options.disabled) return true

    if (isTouchEvent(event) && event.touches) {
      if (event.touches.length !== 1 || !this.startCoords) return true

      if (event.touches[0]) {
        if (
          Math.abs(this.startCoords.x - event.touches[0]?.clientX) < 1 ||
          Math.abs(this.startCoords.y - event.touches[0]?.clientY) < 1
        )
          return true
      }
    }

    return !wrapperComponent || !contentComponent
  }

  handleSetUpPanning = (x: number, y: number) => {
    const { onPanningStart } = this.props
    const { positionX, positionY } = this.stateProvider
    this.isDown = true
    this.startCoords = { x: x - positionX, y: y - positionY }

    onPanningStart && handleCallback(onPanningStart, this.getCallbackProps())
  }

  handleStartPanning = (event: TouchEvent | MouseEvent) => {
    const {
      wrapperComponent,
      contentComponent,
      scale,
      mapSize,
      options: { minScale, maxScale },
      pan: { disabled },
    } = this.stateProvider

    const { target } = event

    if (!wrapperComponent || !contentComponent) return

    if (
      disabled ||
      this.stateProvider.options.disabled ||
      (wrapperComponent && !wrapperComponent.contains(target as HTMLElement)) ||
      this.checkPanningTarget(event) ||
      scale < minScale ||
      scale > maxScale
    )
      return

    handleDisableAnimation(this)
    this.bounds = handleCalculateBounds(wrapperComponent, contentComponent, mapSize, scale)

    if (isTouchEvent(event)) {
      const { touches } = event

      if (touches && touches[0]) {
        this.handleSetUpPanning(touches[0].clientX, touches[0].clientY)
      }
    } else {
      this.handleSetUpPanning(event.clientX, event.clientY)
    }
  }

  handlePanning = (event: TouchEvent | MouseEvent) => {
    const { onPanning } = this.props
    if (this.isDown) event.preventDefault()
    if (this.checkIsPanningActive(event)) return
    event.stopPropagation()
    // TODO - Move as a method of this class
    calculateVelocityStart(this, event)
    handlePanning(this, event)
    onPanning && handleCallback(onPanning, this.getCallbackProps())
  }

  handleStopPanning = () => {
    const { onPanningStop } = this.props

    if (this.isDown) {
      this.isDown = false
      this.animate = false
      this.animation = false
      handleFireVelocity(this)
      onPanningStop && handleCallback(onPanningStop, this.getCallbackProps())

      const {
        pan: { velocity },
        scale,
      } = this.stateProvider

      // start velocity animation
      if (this.velocity && velocity && scale > 1) {
        animateVelocity(this)
      } else {
        // fire fit to bounds animation
        handlePanningAnimation(this)
      }
    }
  }

  //////////
  // Pinch
  //////////

  handlePinchStart = (event: TouchEvent) => {
    const { onPinchingStart } = this.props

    const { scale } = this.stateProvider
    event.preventDefault()
    event.stopPropagation()

    handleDisableAnimation(this)
    const distance = getDistance(event.touches[0], event.touches[1])
    this.pinchStartDistance = distance
    this.lastDistance = distance
    this.pinchStartScale = scale
    this.isDown = false

    onPinchingStart && handleCallback(onPinchingStart, this.getCallbackProps())
  }

  handlePinch = (event: TouchEvent) => {
    const { onPanningStop } = this.props

    this.isDown = false
    handleZoomPinch(this, event)
    onPanningStop && handleCallback(onPanningStop, this.getCallbackProps())
  }

  handlePinchStop = () => {
    const { onPinchingStop } = this.props

    if (typeof this.pinchStartScale === 'number') {
      this.isDown = false
      this.velocity = null
      this.lastDistance = null
      this.pinchStartScale = null
      this.pinchStartDistance = null
      handlePaddingAnimation(this)
      onPinchingStop && handleCallback(onPinchingStop, this.getCallbackProps())
    }
  }

  //////////
  // Touch Events
  //////////

  handleTouchStart = (event: TouchEvent) => {
    const {
      wrapperComponent,
      contentComponent,
      scale,
      options: { disabled, minScale },
    } = this.stateProvider
    const { touches } = event
    if (disabled || !wrapperComponent || !contentComponent || scale < minScale) return
    handleDisableAnimation(this)

    if (touches && touches.length === 1) return this.handleStartPanning(event)
    if (touches && touches.length === 2) return this.handlePinchStart(event)
  }

  handleTouch = (event: TouchEvent) => {
    const { pan, pinch, options } = this.stateProvider
    if (options.disabled) return
    if (!pan.disabled && event.touches.length === 1) return this.handlePanning(event)
    if (!pinch.disabled && event.touches.length === 2) return this.handlePinch(event)
  }

  handleTouchStop = () => {
    this.handleStopPanning()
    this.handlePinchStop()
  }

  //////////
  // Controls
  //////////

  zoomIn = (event: MouseEvent) => {
    const {
      zoomIn: { disabled, step },
      options,
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state

    if (!event) throw Error('Zoom in function requires event prop')
    if (disabled || options.disabled || !wrapperComponent || !contentComponent) return
    handleZoomControls(this, 1, step)
  }

  zoomOut = (event: MouseEvent) => {
    const {
      zoomOut: { disabled, step },
      options,
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state

    if (!event) throw Error('Zoom out function requires event prop')
    if (disabled || options.disabled || !wrapperComponent || !contentComponent) return
    handleZoomControls(this, -1, step)
  }

  handleDbClick = (event: MouseEvent) => {
    const {
      options,
      doubleClick: { disabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state

    if (!event) throw Error('Double click function requires event prop')
    if (disabled || options.disabled || !wrapperComponent || !contentComponent) return
    handleDoubleClick(this, event)
  }

  setScale = (newScale: number, speed: number = 200, type: string = 'easeOut') => {
    const {
      positionX,
      positionY,
      scale,
      options: { disabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state
    if (disabled || !wrapperComponent || !contentComponent) return
    const targetState = {
      positionX,
      positionY,
      scale: isNaN(newScale) ? scale : newScale,
    }

    animateComponent(this, {
      targetState,
      speed,
      type,
    })
  }

  setPositionX = (newPosX: number, speed: number = 200, type: string = 'easeOut') => {
    const {
      positionX,
      positionY,
      scale,
      options: { disabled, transformEnabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state
    if (disabled || !transformEnabled || !wrapperComponent || !contentComponent) return
    const targetState = {
      positionX: isNaN(newPosX) ? positionX : newPosX,
      positionY,
      scale,
    }

    animateComponent(this, {
      targetState,
      speed,
      type,
    })
  }

  setPositionY = (newPosY: number, speed: number = 200, type: string = 'easeOut') => {
    const {
      positionX,
      scale,
      positionY,
      options: { disabled, transformEnabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state
    if (disabled || !transformEnabled || !wrapperComponent || !contentComponent) return

    const targetState = {
      positionX,
      positionY: isNaN(newPosY) ? positionY : newPosY,
      scale,
    }

    animateComponent(this, {
      targetState,
      speed,
      type,
    })
  }

  setTransform = (
    newPosX: number,
    newPosY: number,
    newScale: number,
    speed: number = 200,
    type: string = 'easeOut'
  ) => {
    const {
      positionX,
      positionY,
      scale,
      options: { disabled, transformEnabled },
    } = this.stateProvider
    const { wrapperComponent, contentComponent } = this.state
    if (disabled || !transformEnabled || !wrapperComponent || !contentComponent) return

    const targetState = {
      positionX: isNaN(newPosX) ? positionX : newPosX,
      positionY: isNaN(newPosY) ? positionY : newPosY,
      scale: isNaN(newScale) ? scale : newScale,
    }

    animateComponent(this, {
      targetState,
      speed,
      type,
    })
  }

  resetTransform = () => {
    const {
      options: { disabled, transformEnabled },
    } = this.stateProvider
    if (disabled || !transformEnabled) return
    resetTransformations(this)
  }

  setDefaultState = () => {
    this.animation = null
    this.stateProvider = {
      ...this.stateProvider,
      scale: initialState.scale,
      positionX: initialState.positionX,
      positionY: initialState.positionY,
      ...this.props.defaultValues,
    }

    this.forceUpdate()
  }

  //////////
  // Setters
  //////////

  setWrapperComponent = (wrapperComponent: HTMLDivElement) => {
    this.setState({ wrapperComponent })
  }

  setContentComponent = (contentComponent: HTMLDivElement) => {
    this.setState({ contentComponent }, () => {
      const {
        wrapperComponent,
        options: { centerContent, limitToBounds, limitToWrapper },
        scale,
      } = this.stateProvider

      const { positionX, positionY } = this.props.defaultValues

      if ((limitToBounds && !limitToWrapper) || (centerContent && !positionX && !positionY)) {
        const transform = `translate(25%, 25%) scale(${scale})`
        contentComponent.style.transform = transform
        contentComponent.style.webkitTransform = transform
        // force update to inject state to the context
        this.forceUpdate()
        const startTime = new Date().getTime()
        const maxTimeWait = 2000
        let interval: ISetIntervalId = setInterval(() => {
          if (wrapperComponent?.offsetWidth) {
            this.stateProvider.positionX = 0 //bounds.minPositionX
            this.stateProvider.positionY = 0 //bounds.minPositionY
            this.applyTransformation(null, null, null)
            if (interval) {
              clearInterval(interval)
              interval = null
            }
          } else if (new Date().getTime() - startTime > maxTimeWait) {
            if (interval) {
              clearInterval(interval)
              interval = null
            }
          }
        }, 20)
      } else {
        this.applyTransformation(null, null, null)
      }
    })
  }

  // TODO - remove params as not used
  applyTransformation = (newScale: number | null, posX: number | null, posY: number | null) => {
    if (!this.mounted) return
    const { contentComponent } = this.state
    const { onZoomChange } = this.props
    const { previousScale, scale, positionX, positionY } = this.stateProvider
    if (!contentComponent) return console.error('There is no content component')
    const transform = `translate(${posX || positionX}px, ${posY || positionY}px) scale(${newScale || scale})`
    contentComponent.style.transform = transform
    contentComponent.style.webkitTransform = transform
    // force update to inject state to the context
    this.forceUpdate()
    if (onZoomChange && previousScale !== scale) {
      handleCallback(onZoomChange, this.getCallbackProps())
    }
  }

  //////////
  // Props
  //////////

  getCallbackProps = () => getValidPropsFromObject(this.stateProvider)

  // TODO - Review dispatch helps
  render() {
    const { wrapperComponent, contentComponent } = this.state
    /**
     * Context provider value
     */
    const value = {
      loaded: Boolean(wrapperComponent && contentComponent),
      state: this.getCallbackProps(),
      dispatch: {
        setScale: this.setScale,
        setPositionX: this.setPositionX,
        setPositionY: this.setPositionY,
        zoomIn: this.zoomIn,
        zoomOut: this.zoomOut,
        setTransform: this.setTransform,
        resetTransform: this.resetTransform,
        setDefaultState: this.setDefaultState,
        checkIsPanningActive: this.checkIsPanningActive,
      },
      nodes: {
        setWrapperComponent: this.setWrapperComponent,
        setContentComponent: this.setContentComponent,
      },
    }
    const { children } = this.props
    const content = typeof children === 'function' ? children({ ...value.state, ...value.dispatch }) : children

    return <Context.Provider value={value}>{content}</Context.Provider>
  }
}

export { Context, StateProvider }
