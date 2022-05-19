import { useRef } from 'react'
import { IResource, IResourceStatus } from '../../typings/typings'
import { Label, Arrow, Text } from './callout.styled'
import { calculateRelativeToScale } from './callout.utls'

interface IResourceCalloutProps {
  mapScale: number
  ratio: number
  resource: IResource
  resourceStatus: IResourceStatus
  statusColors: Record<string, string>
}

export const ResourceCallout = (props: IResourceCalloutProps) => {
  const labelRef = useRef<HTMLDivElement>(null)

  const {
    mapScale,
    resource,
    ratio,
    resourceStatus: { status, userDisplayName },
    statusColors,
  } = props

  const { zoomOffsetScale, centerOfLabel, pixelOffset } = calculateRelativeToScale(labelRef?.current, mapScale)

  const { x, y, name: resourceName } = resource

  const color = statusColors[status]

  return (
    <Label
      ref={labelRef}
      style={{ transform: `translate(-50%, -${pixelOffset}px) scale(${zoomOffsetScale}` }}
      ratio={ratio}
      x={x}
      y={y}
      centerOfLabel={centerOfLabel}
    >
      <Text color={color}>
        <div>{resourceName}</div>
        {userDisplayName && <div>{userDisplayName}</div>}
      </Text>
      <Arrow color={color} />
    </Label>
  )
}
