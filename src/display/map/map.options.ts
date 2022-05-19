export const mapOptions = ({
  disableInteraction,
  minScale,
  maxScale,
  disablePan,
  disableZoom,
  step,
  mapPixelHeight,
  mapPixelWidth,
  parentWidth,
  parentHeight,
  mapWidth,
  mapHeight,
  ratio,
}: {
  disableInteraction: boolean
  minScale: number
  maxScale: number
  disablePan: boolean
  disableZoom: boolean
  step: number
  mapPixelHeight: number
  mapPixelWidth: number
  ratio: number
  parentWidth: number
  parentHeight: number
  mapWidth: number
  mapHeight: number
}) => {
  return {
    options: {
      limitToBounds: true,
      transformEnabled: true,
      disabled: disableInteraction,
      minScale: minScale,
      maxScale: maxScale,
    },
    pan: {
      disabled: disablePan,
      velocity: true,
      velocitySensitivity: 2,
      velocityActiveScale: 1,
    },
    pinch: { disabled: disableZoom },
    doubleClick: { disabled: disableZoom },
    wheel: {
      wheelEnabled: !disableZoom,
      touchPadEnabled: !disableZoom,
      step: step,
    },
    mapSize: {
      mapPixelWidth,
      mapPixelHeight,
      ratio,
      parentWidth,
      parentHeight,
      mapWidth,
      mapHeight,
    },
  }
}
