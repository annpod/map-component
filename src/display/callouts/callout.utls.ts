export const calculateRelativeToScale = (Label: HTMLDivElement | null, mapScale: number) => {
  if (!Label) {
    return {
      zoomOffsetScale: 1,
      centerOfLabel: 1,
      pixelOffset: 1,
    }
  }
  const zoomOffsetScale = 1 / mapScale
  const centerOfLabel = Label.offsetHeight / 2
  const pixelOffset = centerOfLabel * zoomOffsetScale

  return {
    zoomOffsetScale,
    centerOfLabel,
    pixelOffset,
  }
}
