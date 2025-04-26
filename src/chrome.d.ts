declare namespace chrome {
    namespace runtime {
      function sendMessage<T = any>(
        message: any,
        callback?: (response: T) => void
      ): void;
  
      const onMessage: {
        addListener(
          callback: (
            message: any,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response?: any) => void
          ) => void
        ): void;
  
        removeListener(
          callback: (
            message: any,
            sender: chrome.runtime.MessageSender,
            sendResponse: (response?: any) => void
          ) => void
        ): void;
      };
    }
  
    namespace runtime {
      interface MessageSender {
        tab?: chrome.tabs.Tab;
        frameId?: number;
        id?: string;
        url?: string;
        tlsChannelId?: string;
      }
    }
  
    namespace tabs {
      interface Tab {
        id?: number;
        index: number;
        pinned: boolean;
        highlighted: boolean;
        windowId: number;
        active: boolean;
        url?: string;
        title?: string;
        favIconUrl?: string;
        status?: string;
        incognito: boolean;
        audible?: boolean;
        width?: number;
        height?: number;
      }
    }
  }