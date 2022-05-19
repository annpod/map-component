import { IFocusTo, IPointOfInterest, IYouAreHere } from 'map-web-core'
import { IRoute } from '../../dist/typings/typings'

export interface IInitialState {
  interactions: {
    disableInteraction: boolean
    disablePan: boolean
    disableZoom: boolean
  }
  youAreHere: IYouAreHere
  route: IRoute
  focusTo: IFocusTo | string
  showResourcesByKey: string[]
  pointsOfInterest: IPointOfInterest[]
  selectedPointsOfInterest: string[]
}

export const initialState: IInitialState = {
  interactions: {
    disableInteraction: false,
    disablePan: false,
    disableZoom: false,
  },
  youAreHere: {
    x: -1,
    y: -1,
    bearing: -1,
  },
  route: {
    steps: [],
    status: 'paused',
    isAnimated: true,
    padding: 100,
    velocity: 5,
  },
  focusTo: {
    x: 1920 / 2,
    y: 1080 / 2,
    scale: 'default',
    animated: false,
  },
  showResourcesByKey: [],
  pointsOfInterest: [],
  selectedPointsOfInterest: [],
}
