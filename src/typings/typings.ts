export type Steps = [number, number]
export type Route = NonEmptyArray<Steps> | Array<never>
export type RouteStatus = 'running' | 'paused'

export interface IYouAreHere {
  x: number
  y: number
  bearing: number
}

export interface IViewAreaStatusResponse {
  timestamp: string
  changes: IDictionary<IResourceStatus>
}

export interface IViewAreaResponse {
  siteKey: string
  areaKey: string
  name: string
  estateBuildingKey: string
  estateFloorKey: string
  mapImageMapResourceKey: string
  overlaySvgMapResourceKey: string
  resources: IDictionary<IResource>
}

export interface IResourceStatus {
  bookingUser: string | null
  neighbourhoodKey: string | null
  resourceKey: string
  resourceType: string
  status: string
  userDisplayName: string | null
}

export interface IResource {
  name: string
  resourceKey: string
  resourceType: string
  path: string
  x: number
  y: number
}

export interface ICalloutPosistion {
  x: number
  y: number
  name: string
}

export interface IFocusTo {
  x: number
  y: number
  scale: string | number | null
  animated: boolean
}

export interface IDownloadResourceResponse {
  filePath: string
  expiresInSeconds: number
  pixelBounds: {
    x1: number
    y1: number
    x2: number
    y2: number
  }
}

export interface IViewAreaRequest {
  siteKey?: string | null
  areaKey?: string | null
  estateFloorKey?: string | null
  resourceTypes?: ResourceType[]
  timestamp?: string | null
}

export interface ILocationKeys {
  siteKey?: string | null
  areaKey?: string | null
  estateFloorKey?: string | null
}
export interface IViewAreaStatusRequest extends ILocationKeys {
  resourceTypes?: ResourceType[]
  timestamp?: string | null
  timestampEnd?: string | null
  neighbourhoodKeys?: string[]
  deskFeatureIds?: string[]
}
export interface IDownloadResourceRequest extends ILocationKeys {
  resourceKey: string
}

export interface IViewPointsOfInterestRequest extends ILocationKeys {
  includeNodeTypes: string[]
  excludeNodeTypes: string[]
  nearestX: string | null
  nearestY: string | null
  numberOfResults: string | null
}

export interface IViewPointsOfInterestResponse {
  pointsOfInterest: IPointOfInterest[]
}

export interface IDictionary<TValue> {
  [id: string]: TValue
}

export interface IPointOfInterest {
  resourceKey: string
  iconMapResource: string | null
  name: string
  resourceType: string
  x: number
  y: number
}

export type Step = [number, number]

export type NonEmptyArray<T> = [T, ...T[]]

export interface IRoute {
  steps: NonEmptyArray<Steps> | never[]
  status: RouteStatus
  isAnimated: boolean
  padding?: number
  velocity: number
}

export interface IInteractions {
  disableInteraction: boolean
  disablePan: boolean
  disableZoom: boolean
}

export interface IRouteStages {
  isAccessible: boolean
  stages: IRouteStage[]
}

export interface IRouteStage {
  floorKey: string
  callouts: ICallout[]
  steps: Route
  text: string
}

export interface ICallout {
  name: string
  resourceType: string
  resourceKey: string
  iconMapResource: string | null
  stepIndex?: number
  x: number
  y: number
}

export type MapSize = {
  mapPixelWidth: number
  mapPixelHeight: number
  ratio: number
  parentWidth: number
  parentHeight: number
  mapWidth: number
  mapHeight: number
}

export type ShowResourceEventType = 'CLICK' | 'HOVER' | 'ALL'

export type ResourceType = 'DESK' | 'ROOM'
