import { DebugC } from '../common.styled'

interface IDebugProps {
  positionX: number
  positionY: number
  scale: number
  previousScale: number
  ratio?: number
  display: boolean
}

export const Debug = (props: IDebugProps) => {
  const { positionX, positionY, scale, previousScale, ratio, display } = props

  if (!display) {
    return null
  }

  return (
    <DebugC>
      <h3>State</h3>
      <h5>
        <div>Position x : {positionX}px</div>
        <div>Position y : {positionY}px</div>
        <div>Scale : {scale}</div>
        <div>Previous scale : {previousScale}</div>
        <div>Ratio : {ratio}</div>
      </h5>
    </DebugC>
  )
}
