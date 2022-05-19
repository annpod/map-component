import { FC } from 'react'
import { StateProvider } from '../store/StateContext'
import { OnEventCallbackTypes, DynamicValues } from '../store/types'

import { deleteUndefinedProps } from '../store/utils'

type DefaultValues = {
  defaultScale?: number
  defaultPositionX?: number
  defaultPositionY?: number
}

const TransformWrapper: FC<DynamicValues & DefaultValues & Partial<OnEventCallbackTypes>> = ({
  children,
  defaultPositionX,
  defaultPositionY,
  defaultScale,
  onWheelStart,
  onWheel,
  onWheelStop,
  onPanningStart,
  onPanning,
  onPanningStop,
  onPinchingStart,
  onPinching,
  onPinchingStop,
  onZoomChange,
  ...rest
}) => {
  const props = { ...rest }
  if (props.options && props.options.limitToWrapper) {
    props.options.limitToBounds = true
  }

  return (
    <StateProvider
      defaultValues={deleteUndefinedProps({
        positionX: defaultPositionX,
        positionY: defaultPositionY,
        scale: defaultScale,
      })}
      dynamicValues={deleteUndefinedProps(props)}
      onWheelStart={onWheelStart}
      onWheel={onWheel}
      onWheelStop={onWheelStop}
      onPanningStart={onPanningStart}
      onPanning={onPanning}
      onPanningStop={onPanningStop}
      onPinchingStart={onPinchingStart}
      onPinching={onPinching}
      onPinchingStop={onPinchingStop}
      onZoomChange={onZoomChange}
    >
      {children}
    </StateProvider>
  )
}

export { TransformWrapper }
