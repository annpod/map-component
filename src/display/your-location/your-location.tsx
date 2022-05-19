import styled from 'styled-components'
import { IYouAreHere } from '../../typings/typings'
import { Layer } from '../common.styled'

interface IYouAreHereProps {
  youAreHere?: IYouAreHere
}

export const YourLocation = (props: IYouAreHereProps) => {
  const { youAreHere } = props

  if (!youAreHere || youAreHere.x === -1 || youAreHere.y === -1) {
    return null
  }

  return (
    <Layer>
      <Dot x={youAreHere.x} y={youAreHere.y} bearing={youAreHere.bearing}>
        {youAreHere.bearing >= 0 && (
          <Icon>
            <Arrow />
          </Icon>
        )}
      </Dot>
    </Layer>
  )
}

const Dot = styled.div.attrs(({ x, y, bearing }: IYouAreHere) => ({
  style: {
    left: `${x}px`,
    top: `${y}px`,
    transform: `rotate(${bearing}deg)`,
  },
}))<IYouAreHere>`
  z-index: 100;
  position: absolute;
  width: 15px;
  height: 15px;
  border-radius: 100%;
  background: blue;
`

const Icon = styled.div`
  position: absolute;
  top: 50%;
  left: 100%;
  width: 40px;
  height: 30px;
  transform: translate(-70%, -100%) rotate(-90deg);
`

const Arrow = styled.div`
  position: absolute;
  top: 12.5px;
  width: 90%;
  height: 5px;
  background-color: blue;

  &::after,
  &::before {
    content: '';
    position: absolute;
    width: 60%;
    height: 5px;
    right: -4px;
    background-color: blue;
  }

  &::after {
    top: -6px;
    transform: rotate(45deg);
  }

  &::before {
    top: 6px;
    transform: rotate(-45deg);
  }
`
