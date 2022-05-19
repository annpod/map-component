import { useState } from 'react'
import { viewPointsOfInterestRequest } from './api/manager'
import {
  IPointOfInterest,
  IViewPointsOfInterestRequest,
  IResource,
  CENTER_OF_MAP,
  IRouteStage,
  ICallout,
} from 'map-web-core'
import { IInitialState, initialState } from './initialState'
// import { areaInterop } from "./mobile/mobileMessageHandler";

interface IProps {
  siteKey?: string
  areaKey?: string
  estateFloorKey?: string
}

type DisplayState = {
  state: IInitialState
  fetchPoints: (request: IViewPointsOfInterestRequest) => Promise<void>
  playRouteStage: (stage: IRouteStage) => void
  selectResource: (resource: IResource) => void
  cancelResource: (resourceType: string, resourceKey: string) => void
  selectPoi: (resourceType: string, resourceKey: string) => void
  toggleInteraction: (poi: IPointOfInterest) => void
  togglePan: () => void
  toggleZoom: () => void
  centerMap: () => void
  cancelPoi: (poi: IPointOfInterest) => void
  onClickBackground: () => void
}

export const useDisplayState = ({ siteKey, areaKey, estateFloorKey }: IProps): DisplayState => {
  const [state, setState] = useState(initialState)

  const playRouteStage = (stage: IRouteStage) => {
    const { steps, callouts } = stage

    setState((s) => ({
      ...s,
      route: {
        ...s.route,
        steps: steps,
        status: 'running',
        padding: 100,
        isAnimated: true,
        velocity: 5,
      },
      pointsOfInterest: filterPoi(callouts),
      showResourcesByKey: filterResources(callouts),
    }))
  }

  const fetchPoints = async ({
    includeNodeTypes,
    excludeNodeTypes,
    nearestX,
    nearestY,
    numberOfResults,
  }: IViewPointsOfInterestRequest) => {
    const response = await viewPointsOfInterestRequest({
      siteKey,
      areaKey,
      estateFloorKey,
      includeNodeTypes,
      excludeNodeTypes,
      nearestX,
      nearestY,
      numberOfResults,
    })

    setState((s) => ({
      ...s,
      pointsOfInterest: response.data.pointsOfInterest,
    }))
  }

  const selectResource = (resource: IResource) => {
    const { resourceKey, resourceType, x, y } = resource
    const key = `${resourceType}_${resourceKey}`

    // areaInterop("SELECT", resourceType, resourceKey);

    setState((s) => ({
      ...s,
      showResourcesByKey: [key],
      focusTo: {
        x,
        y,
        scale: null,
        animated: true,
      },
    }))
  }

  const cancelResource = (_resourceType: string, _resourceKey: string) => {
    // areaInterop("CANCEL", resourceType, resourceKey);
    setState((s) => ({
      ...s,
      showResourcesByKey: [],
    }))
  }

  const selectPoi = (resourceType: string, resourceKey: string) => {
    const key = `${resourceType}_${resourceKey}`

    if (state.selectedPointsOfInterest.includes(key)) {
      // areaInterop("CANCEL", resourceType, resourceKey);
      setState((s) => ({
        ...s,
        selectedPointsOfInterest: s.selectedPointsOfInterest.filter((poi: string) => poi !== key),
      }))
      return
    }

    // areaInterop("SELECT", resourceType, resourceKey);

    setState((s) => ({
      ...s,
      selectedPointsOfInterest: [...s.selectedPointsOfInterest, key],
    }))
  }

  const cancelPoi = (_poi: IPointOfInterest) => {
    // const { resourceType, estateResourceKey } = poi;

    // areaInterop("CANCEL", resourceType, estateResourceKey);
    setState((s) => ({
      ...s,
      pointsOfInterest: [],
      selectedPointsOfInterest: [],
    }))
  }

  const toggleInteraction = () => {
    setState((s) => ({
      ...s,
      interactions: {
        ...s.interactions,
        disableInteraction: !s.interactions.disableInteraction,
      },
    }))
  }
  const togglePan = () => {
    setState((s) => ({
      ...s,
      interactions: {
        ...s.interactions,
        disablePan: !s.interactions.disablePan,
      },
    }))
  }
  const toggleZoom = () => {
    setState((s) => ({
      ...s,
      interactions: {
        ...s.interactions,
        disableZoom: !s.interactions.disableZoom,
      },
    }))
  }

  const centerMap = () => {
    setState((s) => ({
      ...s,
      focusTo: {
        ...CENTER_OF_MAP,
        scale: 'default',
        animated: true,
      },
    }))
  }

  const onClickBackground = () => {
    state.showResourcesByKey.forEach((_resource: string) => {
      // const [key, type] = resource.split("_");
      cancelResource && cancelResource('', '')
    })
    state.pointsOfInterest?.forEach((poi: IPointOfInterest) => {
      cancelPoi && cancelPoi(poi)
    })
  }

  return {
    state,
    fetchPoints,
    playRouteStage,
    selectResource,
    cancelResource,
    selectPoi,
    toggleInteraction,
    togglePan,
    toggleZoom,
    centerMap,
    cancelPoi,
    onClickBackground,
  }
}

const filterPoi = (callouts: ICallout[]) => {
  return callouts.filter((c: ICallout) => c.resourceType !== 'DESK' && c.resourceType !== 'ROOM')
}

const filterResources = (callouts: ICallout[]) => {
  return callouts
    .filter((c: ICallout) => c.resourceType === 'DESK' || c.resourceType === 'ROOM')
    .map((c: ICallout) => `${c.resourceType}_${c.resourceKey}`)
}
