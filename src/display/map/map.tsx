import { useCallback } from 'react'
import { FullWidthContainer, MainContainer } from '../common.styled'

import {
  IResource,
  IResourceStatus,
  IYouAreHere,
  IPointOfInterest,
  IInteractions,
  IFocusTo,
  IRoute,
  ShowResourceEventType,
} from '../../typings/typings'
import { Error } from '../error'
import { MapComponents } from './map.components'
import { MapProvider } from './map.context'
import { MapTransform } from './map.transform'
import { IStateManager } from '../../cmpManager/useManagerState'
import { IMapRendered } from '../../hooks/has-map-rendered'
import { useManageResourceCallouts } from './map.manageResources'

interface IMapDisplayProps {
  maxScale?: number
  minScale?: number
  step?: number
  showResourcesByKey?: string[]
  youAreHere?: IYouAreHere
  interactions?: IInteractions
  LoadingComponent: React.ElementType
  pointsOfInterest?: IPointOfInterest[]
  selectedPointsOfInterest?: string[]
  selectResourceCallback?: (resource: IResource, resourceStatus: IResourceStatus) => void
  cancelResourceCallback?: (key: string, type: string) => void
  selectPoiCallback?: (resourceType: string, resourceKey: string) => void
  cancelPoiCallback?: (poi: IPointOfInterest) => void
  onClickBackgroundCallback?: () => void
  isVisuallyImpaired?: boolean
  focusTo?: IFocusTo | string
  route?: IRoute
  stateManager: IStateManager
  mapRendered: IMapRendered
  showResourceEventType: ShowResourceEventType
  onAnimationStartCallback?: () => void
  onAnimationEndCallback?: () => void
}

export const MapDisplay = (props: IMapDisplayProps) => {
  const {
    maxScale = 8,
    minScale = 0.5,
    step = 50,
    showResourcesByKey = [],
    youAreHere = {
      x: -1,
      y: -1,
      bearing: -1,
    },
    selectResourceCallback,
    selectPoiCallback,
    interactions = {
      disableInteraction: false,
      disablePan: false,
      disableZoom: false,
    },
    LoadingComponent,
    pointsOfInterest,
    selectedPointsOfInterest,
    cancelPoiCallback,
    isVisuallyImpaired = false,
    focusTo,
    route,
    stateManager: { mapImageUrl, resources, resourceStatuses, mapPixelWidth, mapPixelHeight, hasLoaded, hasErrored },
    mapRendered: { hasMapRendered, setHasMapRendered },
    showResourceEventType,
    onClickBackgroundCallback,
    onAnimationStartCallback,
    onAnimationEndCallback,
  } = props

  const { listOfResourcesToShow, onResourceMouseEnter, onResourceMouseLeave } = useManageResourceCallouts(
    showResourceEventType,
    showResourcesByKey,
    resources
  )

  const selectResource = useCallback(
    (resource: IResource, resourceStatus: IResourceStatus) => {
      if (interactions && interactions.disableInteraction) return
      selectResourceCallback && selectResourceCallback(resource, resourceStatus)
    },
    [interactions, selectResourceCallback]
  )

  const onClickBackground = useCallback(() => {
    if (interactions.disableInteraction) return
    onClickBackgroundCallback && onClickBackgroundCallback()
  }, [interactions.disableInteraction, onClickBackgroundCallback])

  if (hasErrored) {
    return <Error />
  }

  return (
    <MapProvider
      mapPixelWidth={mapPixelWidth}
      mapPixelHeight={mapPixelHeight}
      focusTo={focusTo}
      route={route}
      mapImageUrl={mapImageUrl}
      mapPadding={40}
      resources={resources}
    >
      <MainContainer>
        {(!hasLoaded || !hasMapRendered) && (
          <FullWidthContainer>
            <LoadingComponent />
          </FullWidthContainer>
        )}
        <MapTransform
          maxScale={maxScale}
          minScale={minScale}
          step={step}
          interactions={interactions}
          pointsOfInterest={pointsOfInterest}
          hasMapRendered={hasMapRendered}
          cancelPoiCallback={cancelPoiCallback}
          onClickBackground={onClickBackground}
        >
          <MapComponents
            onResourceMouseEnter={onResourceMouseEnter}
            onResourceMouseLeave={onResourceMouseLeave}
            resources={resources}
            youAreHere={youAreHere}
            resourceStatuses={resourceStatuses}
            listOfResourcesToShow={listOfResourcesToShow}
            pointsOfInterest={pointsOfInterest}
            selectedPointsOfInterest={selectedPointsOfInterest}
            isVisuallyImpaired={isVisuallyImpaired}
            selectResource={selectResource}
            selectPoi={selectPoiCallback}
            hasMapRendered={hasMapRendered}
            setHasMapRendered={setHasMapRendered}
            onAnimationStartCallback={onAnimationStartCallback}
            onAnimationEndCallback={onAnimationEndCallback}
            showResourceEventType={showResourceEventType}
          />
        </MapTransform>
      </MainContainer>
    </MapProvider>
  )
}
