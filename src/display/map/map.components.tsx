import { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { ResourceCallout, PoiCallout } from '../callouts'
import { YourLocation } from '../your-location'
import { Route } from '../route'
import { ImageContainer } from '../common.styled'
import { Overlay } from '../overlay'
import { IResource, IYouAreHere, IDictionary, IPointOfInterest, IResourceStatus } from '../../typings/typings'
import { Context } from '../../store/StateContext'
import { MapContext } from './map.context'
import { ShowResourceEventType } from '../../typings/typings'
import { unavailableResourceStatus } from '../../constants'

interface IMapComponentsProps {
  resources: IDictionary<IResource>
  youAreHere: IYouAreHere
  resourceStatuses: IDictionary<IResourceStatus>
  listOfResourcesToShow: string[]
  selectResource: (resource: IResource, resourceState: IResourceStatus) => void
  pointsOfInterest?: IPointOfInterest[]
  selectPoi?: (resourceType: string, resourceKey: string) => void
  selectedPointsOfInterest?: string[]
  isVisuallyImpaired?: boolean
  hasMapRendered: boolean
  showResourceEventType: ShowResourceEventType
  setHasMapRendered: (b: boolean) => void
  onResourceMouseEnter: (resource: IResource) => void
  onResourceMouseLeave: () => void
  onAnimationStartCallback?: () => void
  onAnimationEndCallback?: () => void
}

export const MapComponents = (props: IMapComponentsProps) => {
  const {
    state: { scale },
  } = useContext(Context)

  const { ratio, route, mapImageUrl } = useContext(MapContext)
  const { statusColors } = useContext(ThemeContext)

  const {
    resources,
    youAreHere,
    resourceStatuses,
    listOfResourcesToShow,
    selectResource,
    pointsOfInterest,
    selectPoi,
    selectedPointsOfInterest,
    isVisuallyImpaired,
    setHasMapRendered,
    onResourceMouseEnter,
    onResourceMouseLeave,
    onAnimationEndCallback,
    onAnimationStartCallback,
    hasMapRendered,
    showResourceEventType,
  } = props

  const colorKey = isVisuallyImpaired ? 'impaired' : 'normal'

  const colors = statusColors[colorKey]

  return (
    <>
      <ImageContainer>
        <img src={mapImageUrl} draggable={false} alt="" onLoad={() => setHasMapRendered && setHasMapRendered(true)} />
      </ImageContainer>
      <Overlay
        resourceStatuses={resourceStatuses}
        resources={resources}
        listOfResourcesToShow={listOfResourcesToShow}
        selectResource={selectResource}
        statusColors={colors}
        onResourceMouseEnter={onResourceMouseEnter}
        onResourceMouseLeave={onResourceMouseLeave}
        showResourceEventType={showResourceEventType}
      />
      {listOfResourcesToShow?.map((key: string) => {
        const resource = resources[key]
        const resourceStatus = resourceStatuses[key] || unavailableResourceStatus

        if (!resource) {
          return null
        }

        return (
          <ResourceCallout
            key={key}
            ratio={ratio}
            mapScale={scale}
            resource={resource}
            resourceStatus={resourceStatus}
            statusColors={colors}
          />
        )
      })}
      {pointsOfInterest?.map((poi: IPointOfInterest) => (
        <PoiCallout
          selectPoi={selectPoi}
          key={poi.resourceKey}
          ratio={ratio}
          mapScale={scale}
          poi={poi}
          selectedPointsOfInterest={selectedPointsOfInterest}
        />
      ))}
      <YourLocation youAreHere={youAreHere} />
      {route && hasMapRendered && (
        <Route
          route={route}
          onAnimationStartCallback={onAnimationStartCallback}
          onAnimationEndCallback={onAnimationEndCallback}
        />
      )}
    </>
  )
}
