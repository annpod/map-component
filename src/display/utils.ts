import { IResource, IDictionary, Step } from '../typings/typings'

const getMinMaxStepOfRoute = (steps: Step[]) => {
  const xSteps = steps.map((s: Step) => s[0])
  const YSteps = steps.map((s: Step) => s[1])

  const xMax = Math.max(...xSteps)
  const xMin = Math.min(...xSteps)
  const yMax = Math.max(...YSteps)
  const yMin = Math.min(...YSteps)

  return { xMax, xMin, yMax, yMin }
}

const parser = new DOMParser()

export const svgParser: (nodes: IDictionary<IResource>) => Record<string, IResource> | Record<string, never> = (
  nodes
) => {
  const overlayNodes = {}

  Object.values(nodes).forEach((node) => {
    const parsed = parser.parseFromString(node.path, 'text/xml').firstChild as SVGPathElement

    const name = parsed.getAttribute('id') as string
    const path = parsed.getAttribute('d') as string

    if (name !== null || path !== null) {
      overlayNodes[`${node.resourceType}_${node.resourceKey}`] = {
        ...node,
        path,
      }
    }
  })

  return overlayNodes
}

// returns coord relative to ratio and scale.
export const coordRelativeToMap = (coord: number, ratio: number, scale: number) => (coord / ratio) * scale

export const getMapInitialSize = (pixelBounds: { x1: number; x2: number; y1: number; y2: number }) => {
  // Returns the pixel w/h of the map image, minus any whitespace.
  const mapPixelWidth = Math.abs(pixelBounds.x1 - pixelBounds.x2)
  const mapPixelHeight = Math.abs(pixelBounds.y1 - pixelBounds.y2)

  return {
    mapPixelHeight,
    mapPixelWidth,
  }
}

export const fitRouteToViewport = (
  routeSteps: Step[],
  parentWidth: number,
  parentHeight: number,
  ratio: number,
  padding: number
) => {
  const PADDING = padding

  const { xMin, xMax, yMin, yMax } = getMinMaxStepOfRoute(routeSteps)

  const scaleX = Math.abs(parentWidth / ((xMin - xMax - PADDING) / ratio))
  const scaleY = Math.abs(parentHeight / ((yMin - yMax - PADDING) / ratio))

  const scale = Math.min(scaleY, scaleX)

  const x = (xMax + xMin) / 2
  const y = (yMax + yMin) / 2

  return {
    x,
    y,
    scale,
  }
}
