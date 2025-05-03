import { useEffect, useState } from "react";

interface Response {
  url: string;
  statusCode: number;
  timestamp?: string;
  contentType?: string;
  body?: any;
}

interface ConfigResponse {
  urlPattern?: string;
  success?: boolean;
}

interface ResponsesData {
  responses: Response[];
}

interface MessageEvent {
  action: string;
  data?: Response;
}

export function useInterceptor() {
  const [urlPattern, setUrlPattern] = useState<string>("");
  const [responses, setResponses] = useState<Response[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Request Interceptor] Popup loaded");

    chrome.runtime.sendMessage(
      { action: "getConfig" },
      function (response: ConfigResponse) {
        console.log(
          "[Request Interceptor] Got config from background:",
          response
        );
        if (response && response.urlPattern) {
          setUrlPattern(response.urlPattern);
          console.log(
            "[Request Interceptor] Loaded URL pattern:",
            response.urlPattern
          );
        }
      }
    );

    loadResponses();

    const messageListener = (message: MessageEvent) => {
      console.log("[Request Interceptor] Popup received message:", message);
      if (message.action === "newResponse" && message.data) {
        console.log(
          "[Request Interceptor] Adding new response to UI:",
          message.data.url
        );
        setResponses((prevResponses) => [message.data!, ...prevResponses]);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up listener when component unmounts
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Load stored responses
  const loadResponses = (): void => {
    console.log("[Request Interceptor] Loading stored responses");
    chrome.runtime.sendMessage(
      { action: "getResponses" },
      function (data: ResponsesData) {
        console.log(
          "[Request Interceptor] Got responses from background:",
          data
        );
        if (data && data.responses && data.responses.length > 0) {
          setResponses(data.responses);
          console.log(
            "[Request Interceptor] Added",
            data.responses.length,
            "responses to UI"
          );
        } else {
          console.log("[Request Interceptor] No responses to display");
          setResponses([]);
        }
      }
    );
  };

  // Save URL pattern
  const savePattern = (): void => {
    const pattern = urlPattern.trim();
    console.log("[Request Interceptor] Save button clicked, pattern:", pattern);

    if (pattern) {
      chrome.runtime.sendMessage(
        {
          action: "setUrlPattern",
          pattern: pattern,
        },
        function (response: ConfigResponse) {
          console.log(
            "[Request Interceptor] Background response to pattern save:",
            response
          );
          if (response && response.success) {
            showStatusMessage("Pattern saved successfully!");
          }
        }
      );
    } else {
      showStatusMessage("Please enter a valid URL pattern");
    }
  };

  // Clear all responses
  const clearResponses = (): void => {
    console.log("[Request Interceptor] Clear button clicked");
    if (
      window.confirm("Are you sure you want to clear all captured responses?")
    ) {
      chrome.runtime.sendMessage(
        { action: "clearResponses" },
        function (response: ConfigResponse) {
          console.log(
            "[Request Interceptor] Background response to clear:",
            response
          );
          if (response && response.success) {
            setResponses([]);
            showStatusMessage("All responses cleared");
          }
        }
      );
    }
  };

  // Format response body for display
  const formatResponseBody = (body: any): string => {
    if (!body) return "No body content available";

    console.log(
      "[Request Interceptor] Formatting response body type:",
      typeof body
    );

    // Handle different body types
    let textToDisplay: string;
    if (typeof body === "object") {
      try {
        textToDisplay = JSON.stringify(body, null, 2);
      } catch (e) {
        console.error("[Request Interceptor] Error stringifying body:", e);
        textToDisplay = String(body);
      }
    } else {
      textToDisplay = String(body);
    }

    return textToDisplay;
  };

  // Show status message
  const showStatusMessage = (message: string): void => {
    console.log("[Request Interceptor] Showing status message:", message);
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage(null);
    }, 3000);
  };

  // Determine status code class for styling
  const getStatusClass = (statusCode: number): string => {
    if (statusCode >= 500) return "status-500";
    if (statusCode >= 400) return "status-400";
    if (statusCode >= 300) return "status-300";
    return "status-200";
  };
}
