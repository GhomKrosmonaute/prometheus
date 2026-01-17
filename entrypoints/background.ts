import type { CaptureScreenshotMessage, CaptureScreenshotResponse } from '@/src/lib/types';

export default defineBackground(() => {
  console.log('[Prometheus] Background script initialized', { id: browser.runtime.id });

  // Écouter les messages du content script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'capture-screenshot') {
      handleCaptureScreenshot(sender.tab?.id)
        .then(sendResponse)
        .catch((error) => {
          console.error('[Prometheus] Screenshot capture error:', error);
          sendResponse({
            success: false,
            error: error.message || 'Unknown error',
          } as CaptureScreenshotResponse);
        });
      
      // Retourner true pour indiquer une réponse asynchrone
      return true;
    }
  });
});

/**
 * Capture un screenshot de l'onglet actif
 */
async function handleCaptureScreenshot(tabId?: number): Promise<CaptureScreenshotResponse> {
  if (!tabId) {
    return {
      success: false,
      error: 'No tab ID provided',
    };
  }

  try {
    // Récupérer la fenêtre de l'onglet
    const tab = await browser.tabs.get(tabId);
    const windowId = tab.windowId;
    
    // Capturer l'onglet visible avec qualité réduite pour économiser l'espace
    const dataUrl = await browser.tabs.captureVisibleTab(windowId, {
      format: 'jpeg',
      quality: 50, // Qualité réduite pour économiser l'espace de stockage
    });

    return {
      success: true,
      dataUrl,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Prometheus] Failed to capture screenshot:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}
