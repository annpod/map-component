import { useCallback } from 'react'
import { IResource, IDictionary, IResourceStatus, ShowResourceEventType } from '../../typings/typings'
import { OverlayContainer, OverlaySvg } from '../common.styled'
import { VIEW_BOX, unavailableResourceStatus } from '../../constants'

interface IOverlayProps {
  selectResource: (resource: IResource, resourceStatus: IResourceStatus) => void
  resources: IDictionary<IResource>
  resourceStatuses: IDictionary<IResourceStatus>
  listOfResourcesToShow: string[]
  statusColors: Record<string, string>
  onResourceMouseEnter: (resource: IResource) => void
  onResourceMouseLeave: () => void
  showResourceEventType: ShowResourceEventType
}

export const Overlay = (props: IOverlayProps) => {
  const {
    resourceStatuses,
    resources,
    listOfResourcesToShow = [],
    selectResource,
    statusColors,
    onResourceMouseEnter,
    onResourceMouseLeave,
    showResourceEventType,
  } = props

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      const resource = resources[(e.target as HTMLElement).id]
      const resourceStatus = resourceStatuses[(e.target as HTMLElement).id] || unavailableResourceStatus
      resource && resourceStatus && selectResource(resource, resourceStatus)
    },
    [resourceStatuses, resources, selectResource]
  )

  const handleMouseOver = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      if (showResourceEventType !== 'HOVER') return
      const resource = resources[(e.target as HTMLElement).id]
      resource && onResourceMouseEnter(resource)
    },
    [resources, showResourceEventType, onResourceMouseEnter]
  )

  const handleMouseOut = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault()
      if (showResourceEventType !== 'HOVER') return
      onResourceMouseLeave()
    },
    [showResourceEventType, onResourceMouseLeave]
  )

  return (
    <OverlayContainer onClick={handleClick} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <OverlaySvg preserveAspectRatio="none" viewBox={VIEW_BOX}>
        {Object.entries(resources).map((r: [string, IResource]) => {
          const [key, resource] = r
          const resourceStatus = resourceStatuses[key]?.status || unavailableResourceStatus.status

          const isSelected = listOfResourcesToShow.includes(key)
          const fillOpacity = isSelected ? 0.3 : 0.7

          return (
            <path key={key} d={resource.path} fill={statusColors[resourceStatus]} fillOpacity={fillOpacity} id={key} />
          )
        })}
      </OverlaySvg>
    </OverlayContainer>
  )
}
