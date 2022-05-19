type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export interface DynamicValues extends DeepPartial<OptionsTypes>, Partial<Scale> {}

export type ContextShape = {
  loaded: boolean
  state: IStateProvider
  dispatch: {
    setScale: (newScale: number, speed?: number, type?: string) => void
    setPositionX: (newPosX: number, speed?: number, type?: string) => void
    setPositionY: (newPosY: number, speed?: number, type?: string) => void
    zoomIn: (event: MouseEvent) => void
    zoomOut: (event: MouseEvent) => void
    setTransform: (newPosX: number, newPosY: number, newScale: number, speed?: number, type?: string) => void
    resetTransform: () => void
    setDefaultState: () => void
    checkIsPanningActive: (event: MouseEvent | TouchEvent) => boolean
  }
  nodes: {
    setWrapperComponent: (wrapperComponent: HTMLDivElement) => void
    setContentComponent: (contentComponent: HTMLDivElement) => void
  }
}

export interface StateContextProps extends OnEventCallbackTypes {
  dynamicValues: DynamicValues
  defaultValues: DefaultValues
}

export type StateContextState = {
  wrapperComponent: HTMLDivElement | undefined | null
  contentComponent: HTMLDivElement | undefined | null
  startAnimation: boolean
}

type MapTransitionTypes = {
  previousScale: number
  positionX: number
  positionY: number
}

export type IStateProvider = MapTransitionTypes & StateContextState & Scale & OptionsTypes

export type Scale = {
  scale: number
}

// TODO - Review Record<string, any> for a more narrow type
export type OnEventCallbackTypes = {
  onWheelStart?: (p: Record<string, IStateProvider>) => void
  onWheel?: (p: Record<string, IStateProvider>) => void
  onWheelStop?: (p: Record<string, IStateProvider>) => void
  onPanningStart?: (p: Record<string, IStateProvider>) => void
  onPanning?: (p: Record<string, IStateProvider>) => void
  onPanningStop?: (p: Record<string, IStateProvider>) => void
  onPinchingStart?: (p: Record<string, IStateProvider>) => void
  onPinching?: (p: Record<string, IStateProvider>) => void
  onPinchingStop?: (p: Record<string, IStateProvider>) => void
  onZoomChange?: (p: Record<string, IStateProvider>) => void
}

export type DefaultValues = {
  scale?: number
  positionX?: number
  positionY?: number
}

type EventCommonTypes = {
  disabled: boolean
  animationType: string
  animationTime: number
}

export type OptionsTypes = {
  options: {
    disabled: boolean
    transformEnabled: boolean
    minPositionX: null
    maxPositionX: null
    minPositionY: null
    maxPositionY: null
    minScale: number
    maxScale: number
    limitToBounds: boolean
    limitToWrapper: boolean
    centerContent: boolean
    wrapperClass: string
    contentClass: string
  }
  wheel: {
    disabled: boolean
    step: number
    wheelEnabled: boolean
    touchPadEnabled: boolean
    limitsOnWheel: boolean
  }
  pan: {
    disabled: boolean
    panAnimationType: string
    lockAxisX: boolean
    lockAxisY: boolean
    velocity: boolean
    velocityEqualToMove: boolean
    velocitySensitivity: number
    velocityActiveScale: number
    velocityMinSpeed: number
    velocityBaseTime: number
    velocityAnimationType: string
    padding: boolean
    paddingSize: number
    panReturnAnimationTime: number
    panReturnAnimationType: string
    disableOnTarget: string[]
  }
  pinch: {
    disabled: boolean
  }
  zoomIn: EventCommonTypes & {
    step: number
    animation: boolean
  }
  zoomOut: EventCommonTypes & {
    step: number
    animation: boolean
  }
  doubleClick: EventCommonTypes & {
    step: number
    mode: string
    animation: boolean
  }
  reset: EventCommonTypes & {
    animation: boolean
  }
  scalePadding: EventCommonTypes & {
    size: number
  }
  mapSize: {
    mapPixelWidth: number
    mapPixelHeight: number
    ratio: number
    parentWidth: number
    mapHeight: number
  }
}

export type Bounds = { minPositionX: number; minPositionY: number; maxPositionX: number; maxPositionY: number }

export type Animation = FrameRequestCallback | boolean | null

export type Velocity =
  | {
      velocityX: number
      velocityY: number
      velocity: number
    }
  | boolean
  | null

export type LastMousePosition =
  | {
      clientX: number
      clientY: number
    }
  | number
  | null
