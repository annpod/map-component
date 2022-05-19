import React, { FC, RefObject, useCallback, useMemo } from 'react'
import { IFocusTo, IRoute, IResource } from '../../typings/typings'
import { fitRouteToViewport, coordRelativeToMap } from '../utils'
import { getDimensions, transformTo } from './map.utils'
import { TransformComponent } from '../../components/TransformComponent'
import { CENTER_OF_MAP } from '../../constants'

interface IPanTo {
  x: number
  y: number
  newScale?: number | null
  animated?: boolean
  time?: number
}

export const MapContext = React.createContext<{
  mapHeight: number
  mapWidth: number
  ratio: number
  parentWidth: number
  parentHeight: number
  wrapperRef: RefObject<HTMLDivElement> | null
  contentRef: RefObject<HTMLDivElement> | null
  mapPixelHeight: number
  mapPixelWidth: number
  transformComponentRef: React.RefObject<TransformComponent> | null
  route?: IRoute
  mapImageUrl: string
  focusTo?: IFocusTo
}>({
  mapHeight: 1,
  mapWidth: 1,
  ratio: 1,
  parentWidth: 1,
  parentHeight: 1,
  wrapperRef: null,
  contentRef: null,
  mapPixelHeight: 1,
  mapPixelWidth: 1,
  transformComponentRef: null,
  mapImageUrl: '',
  route: {
    steps: [],
    status: 'paused',
    isAnimated: false,
    padding: 0,
    velocity: 0,
  },
})

export const MapProvider: FC<{
  mapPixelWidth: number
  mapPixelHeight: number
  route?: IRoute
  mapImageUrl: string
  mapPadding: number
  focusTo?: IFocusTo | string
  resources: Record<string, IResource>
}> = ({ children, mapPixelWidth, mapPixelHeight, route, mapImageUrl, mapPadding = 0, focusTo, resources }) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)
  const transformComponentRef = React.useRef<TransformComponent>(null)

  const [dimensions, setDimensions] = React.useState({
    parentWidth: 1,
    parentHeight: 1,
    ratio: 1,
    mapWidth: 1,
    mapHeight: 1,
  })
  const { parentWidth, parentHeight, ratio, mapWidth, mapHeight } = dimensions

  const transform = useCallback((x: number, y: number, scale: number, animationTime: number, animationType: string) => {
    const setTransform = transformComponentRef?.current?.context.dispatch.setTransform

    if (!setTransform) return

    const cb = () => setTransform(x, y, scale, animationTime, animationType)

    window.requestAnimationFrame(cb)
  }, [])

  const getScaleHashMap = useMemo(
    () =>
      (
        parentWidth: number,
        parentHeight: number,
        ratio: number,
        mapPixelHeight: number,
        mapPixelWidth: number,
        padding: number
      ) => {
        const SCALE_PADDING = padding

        const scaleW = (parentWidth * ratio - SCALE_PADDING) / mapPixelWidth
        const scaleH = (parentHeight * ratio - SCALE_PADDING) / mapPixelHeight
        const scale = Math.min(scaleW, scaleH)

        return {
          default: scale,
          context: scale * 3,
        }
      },
    []
  )

  const panTo = useCallback(
    ({ x, y, newScale = null, animated = false, time = 800 }: IPanTo) => {
      if (!transformComponentRef.current) return

      const animationTime = animated ? time : 0
      const animationType = animated ? 'linear' : ''

      const scale = newScale ? newScale : transformComponentRef.current.context.state.scale

      const xRelativeToMap = coordRelativeToMap(x, ratio, scale)
      const yRelativeToMap = coordRelativeToMap(y, ratio, scale)

      const xTo = transformTo(xRelativeToMap, mapWidth)
      const yTo = transformTo(yRelativeToMap, mapHeight)

      transform(xTo, yTo, scale, animationTime, animationType)
    },
    [mapHeight, mapWidth, ratio, transform]
  )

  React.useEffect(() => {
    if (!wrapperRef.current) return
    setDimensions(getDimensions(wrapperRef.current))
  }, [wrapperRef])

  React.useEffect(() => {
    if (!focusTo || !Object.keys(resources).length) return

    const scaleHashMap: Record<string, number> = getScaleHashMap(
      parentWidth,
      parentHeight,
      ratio,
      mapPixelHeight,
      mapPixelWidth,
      mapPadding
    )

    // Center if no focusTo prop is passed
    if (!focusTo) {
      panTo({ ...CENTER_OF_MAP, newScale: scaleHashMap.default })
      // Centers map on resource key
    } else if (typeof focusTo === 'string') {
      const { x, y } = resources[focusTo] as IResource
      panTo({ x, y, newScale: null, animated: true, time: 400 })
    } else {
      const { x, y, scale, animated } = focusTo
      const newScale = typeof scale === 'string' ? scaleHashMap[scale] : scale
      panTo({ x, y, newScale, animated, time: 400 })
    }
  }, [
    focusTo,
    getScaleHashMap,
    mapPadding,
    mapPixelHeight,
    mapPixelWidth,
    panTo,
    parentHeight,
    parentWidth,
    ratio,
    resources,
  ])

  React.useEffect(() => {
    if (!route) {
      return
    }

    const { x, y, scale } = fitRouteToViewport(
      route.steps,
      dimensions.parentWidth,
      dimensions.parentHeight,
      dimensions.ratio,
      route.padding || 200
    )

    panTo({ x, y, newScale: scale, animated: true, time: 400 })
  }, [dimensions.parentHeight, dimensions.parentWidth, dimensions.ratio, panTo, route])

  const value = {
    ...dimensions,
    wrapperRef,
    contentRef,
    mapPixelHeight,
    mapPixelWidth,
    transformComponentRef,
    route,
    mapImageUrl,
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}
