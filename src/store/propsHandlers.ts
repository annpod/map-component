import { IStateProvider } from './types'

export const propsList = [
  'previousScale',
  'scale',
  'positionX',
  'positionY',
  'defaultPositionX',
  'defaultPositionY',
  'defaultScale',
  'onWheelStart',
  'onWheel',
  'onWheelStop',
  'onPanningStart',
  'onPanning',
  'onPanningStop',
  'onPinchingStart',
  'onPinching',
  'onPinchingStop',
  'onZoomChange',
  'options',
  'wheel',
  'scalePadding',
  'pan',
  'pinch',
  'zoomIn',
  'zoomOut',
  'doubleClick',
  'reset',
  'mapSize',
] as const

// TODO - Review Record<string, any> for a more narrow type
export const getValidPropsFromObject = <K extends keyof IStateProvider>(props: IStateProvider) => {
  return Object.keys(props).reduce<IStateProvider>((acc, key) => {
    if (propsList.includes(key as typeof propsList[number])) {
      acc[key] = props[key as K]
    }
    return acc
  }, {} as IStateProvider)
}
