export interface MessageInterop {
  mapViewInterop: {
    action: string
    type?: string
    key?: string
  }
}

const postToNative = (json: MessageInterop): void => {
  console.log(json)
  try {
    const iosCallbackHander = window?.webkit?.messageHandlers?.callbackHandler
    const androidInterface = window?.AndroidInterface

    if (iosCallbackHander) {
      iosCallbackHander.postMessage(json)
    } else if (androidInterface) {
      //Android only supports passing primitive types and strings. You cannot pass arbitrary Javascript objects.
      const str = JSON.stringify(json)
      androidInterface.postMessage(str)
    } else {
      // console.log(json)
    }
  } catch (error) {
    alert(error)
  }
}

export const areaInterop = (action: string, resourceType: string, resourceKey: string): void => {
  try {
    const msg = {
      mapViewInterop: {
        action,
        type: resourceType,
        key: resourceKey,
      },
    }
    postToNative(msg)
  } catch (error) {
    alert(error)
  }
}

export const requestToken = (): void => {
  try {
    const msg = {
      mapViewInterop: {
        action: 'TOKEN_REQUEST',
      },
    }
    postToNative(msg)
  } catch (error) {
    alert(error)
  }
}
