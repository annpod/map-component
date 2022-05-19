import { MAP_WIDTH, MAP_HEIGHT } from '../../constants'

export const getDimensions = (parentComponent: HTMLDivElement) => {
  //containerW
  const parentWidth = parentComponent.offsetWidth || 0
  //conatinerH
  const parentHeight = parentComponent.offsetHeight || 0

  // returns the best fit of 1920x1080 in containerRef
  const ratio = Math.max(1, Math.round((MAP_WIDTH / parentWidth) * 100) / 100)

  const mapHeight = Math.min(MAP_HEIGHT, MAP_HEIGHT / ratio)
  const mapWidth = Math.min(MAP_WIDTH, MAP_WIDTH / ratio)

  return { parentWidth, parentHeight, ratio, mapWidth, mapHeight }
}

export const transformTo = (to: number, width: number) => {
  return -Math.abs(to) + width / 2
}
