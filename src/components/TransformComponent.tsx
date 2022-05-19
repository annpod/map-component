import React, { RefObject } from 'react'
import { Context } from '../store/StateContext'

interface IProps {
  onClickBackground: () => void
  hasMapRendered: boolean
  width: number
  height: number
  wrapperRef: RefObject<HTMLDivElement> | null
  contentRef: RefObject<HTMLDivElement> | null
}

class TransformComponent extends React.Component<IProps> {
  private clientX: null | number = null
  private clientY: null | number = null
  static contextType = Context
  declare context: React.ContextType<typeof Context>

  componentDidMount() {
    const { nodes } = this.context

    if (!this.props.wrapperRef?.current || !this.props.contentRef?.current) return

    nodes.setWrapperComponent(this.props.wrapperRef.current)
    nodes.setContentComponent(this.props.contentRef.current)
  }

  onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    this.clientX = e.clientX
    this.clientY = e.clientY
  }

  onMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.clientX === this.clientX && e.clientY === this.clientY) {
      this.props.onClickBackground()
    }
  }

  render() {
    const { children, hasMapRendered = false, height, width } = this.props
    const {
      state: { positionX, positionY, scale },
    } = this.context

    const elementStyle = {
      WebkitTransform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
      transform: `translate(${positionX}px, ${positionY}px) scale(${scale})`,
      height,
      width,
    }

    return (
      <div
        id="react-transform-component"
        ref={this.props.wrapperRef}
        className={`react-transform-component`}
        style={{
          visibility: hasMapRendered ? 'visible' : 'hidden',
        }}
        onMouseDown={this.onMouseDown}
        onMouseUp={this.onMouseUp}
      >
        <div ref={this.props.contentRef} className={`react-transform-element`} style={elementStyle}>
          {children}
        </div>
      </div>
    )
  }
}

// TransformComponent.contextType = Context

export { TransformComponent }
