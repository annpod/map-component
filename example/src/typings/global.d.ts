import { MessageInterop } from '../mobile/mobileMessageHandler'
export {}
declare global {
  interface Window {
    webkit: {
      messageHandlers: {
        callbackHandler: {
          postMessage: (message: MessageInterop) => void
        }
      }
    }
    AndroidInterface: {
      postMessage: (message: string) => void
    }
    mobileWebViewApi?: {
      postToken?: (t: string) => void
    }
  }
}
