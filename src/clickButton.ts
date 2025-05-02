export async function handlerClickPause(id: string) {
  chrome.tabs.query(
    { url: "https://helpdesk.valenet.local:8443/*" },
    function (tabs) {
      tabs.forEach((tab) => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id as number },
          func: applyPause,
          args: [id],
        });
      });
    }
  );
}

function applyPause(pauseId: string) {
  function clickElement(selector: string): boolean {
    const element = document.querySelector(selector);
    if (element) {
      (element as HTMLElement).click();
      return true;
    }
    return false;
  }

  function selectOption(): boolean {
    const selectElement = document.querySelector(".bootbox-input-select");
    if (selectElement) {
      (selectElement as HTMLSelectElement).value = pauseId;
      const event = new Event("change", { bubbles: true });
      selectElement.dispatchEvent(event);
      return true;
    }
    return false;
  }

  function confirmPause(): boolean {
    const confirmButton = document.querySelector(
      'button[data-bb-handler="confirm"]'
    );
    if (confirmButton) {
      (confirmButton as HTMLElement).click();
      return true;
    }
    return false;
  }

  if (clickElement('a[href="#"][onclick*="TogglePausa"]')) {
    setTimeout(() => {
      if (selectOption()) {
        setTimeout(() => {
          confirmPause();
        }, 500);
      }
    }, 500);
  } else {
    console.error("Botão de pausa não encontrado!");
  }
}
