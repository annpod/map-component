import React from 'react'
import { TransformWrapper, TransformComponent } from '../../components'

import { IPointOfInterest, IInteractions } from '../../typings/typings'
import { mapOptions } from './map.options'
import { MapContext } from './map.context'

interface MapTransformProps {
  maxScale?: number
  minScale?: number
  step?: number
  interactions: IInteractions
  pointsOfInterest?: IPointOfInterest[]
  selectedPointsOfInterest?: string[]
  onClickBackground: () => void
  selectPoiCallback?: (resourceType: string, resourceKey: string) => void
  cancelPoiCallback?: (poi: IPointOfInterest) => void
  children: React.ReactChild
  hasMapRendered: boolean
}

export const MapTransform = (props: MapTransformProps) => {
  const { maxScale = 8, minScale = 0.5, step = 50, interactions, onClickBackground, hasMapRendered } = props

  const {
    mapHeight,
    mapWidth,
    ratio,
    parentWidth,
    parentHeight,
    wrapperRef,
    contentRef,
    transformComponentRef,
    mapPixelHeight,
    mapPixelWidth,
  } = React.useContext(MapContext)

  return (
    <TransformWrapper
      {...mapOptions({
        ...interactions,
        minScale,
        maxScale,
        step,
        mapPixelHeight,
        mapPixelWidth,
        parentWidth,
        parentHeight,
        mapWidth,
        mapHeight,
        ratio,
      })}
    >
      <TransformComponent
        ref={transformComponentRef}
        hasMapRendered={hasMapRendered}
        width={mapWidth}
        height={mapHeight}
        wrapperRef={wrapperRef}
        contentRef={contentRef}
        onClickBackground={onClickBackground}
      >
        {props.children}
      </TransformComponent>
    </TransformWrapper>
  )
}
