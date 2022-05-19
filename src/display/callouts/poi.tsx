import { useRef } from 'react'
import { Label, Arrow, Text, IconContainer, Icon } from './callout.styled'
import { IPointOfInterest } from '../../typings/typings'
import { calculateRelativeToScale } from './callout.utls'

interface IPoiCalloutProps {
  mapScale: number
  ratio: number
  poi: IPointOfInterest
  selectPoi?: (resourceType: string, resourceKey: string) => void
  selectedPointsOfInterest?: string[]
}

export const PoiCallout = (props: IPoiCalloutProps) => {
  const labelRef = useRef<HTMLDivElement>(null)

  const { mapScale, ratio, poi, selectPoi, selectedPointsOfInterest } = props

  const { iconMapResource, x, y, name, resourceKey, resourceType } = poi

  const { zoomOffsetScale, centerOfLabel, pixelOffset } = calculateRelativeToScale(labelRef?.current, mapScale)

  const isSelected = selectedPointsOfInterest?.includes(`${poi.resourceType}_${poi.resourceKey}`)

  const color = isSelected ? 'red' : 'grey'

  return (
    <Label
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => selectPoi && selectPoi(resourceType, resourceKey)}
      ref={labelRef}
      style={{ transform: `translate(-50%, -${pixelOffset}px) scale(${zoomOffsetScale}` }}
      ratio={ratio}
      x={x}
      y={y}
      centerOfLabel={centerOfLabel}
    >
      <Text color={color}>{name}</Text>
      <Arrow color={color} />
      <IconContainer>{iconMapResource && <Icon src={iconMapResource} alt="" />}</IconContainer>
    </Label>
  )
}
