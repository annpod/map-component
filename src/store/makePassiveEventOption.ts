// We want to make event listeners non-passive, and to do so have to check
// that browsers support EventListenerOptions in the first place.
// https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
const passiveSupported = false

function makePassiveEventOption(passive: boolean) {
  return passiveSupported ? { passive } : passive
}

export default makePassiveEventOption
