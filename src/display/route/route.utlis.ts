import { Step } from '../../typings/typings'

export const getPathToBeDrawn = (routeSteps: Step[]) => {
  return routeSteps.reduce((line, cord, index) => {
    if (index === 0) {
      return `M ${cord.toString()} `
    }
    return line + `L ${cord.toString()} `
  }, '')
}
