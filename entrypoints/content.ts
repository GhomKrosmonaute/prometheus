import { loadSettings, saveScreenshot } from '@/src/lib/storage';
import { isDomainDisabled, normalizeUrl } from '@/src/lib/url-utils';
import { initLinkTracking } from '@/src/lib/link-tracker';
import { extractEligibleLinks, observeDOMChanges } from '@/src/lib/link-selector';
import { createPanel, showIframe, hideIframes, hidePanel } from '@/src/lib/panel';
import { preloadUrls } from '@/src/lib/preloader';
import { navigateWithTransition } from '@/src/lib/navigation';
import { DEFAULT_DISPLAY_COUNT } from '@/src/lib/constants';
import type { CaptureScreenshotResponse } from '@/src/lib/types';

export default defineContentScript({
  matches: ['<all_urls>'],
  
  async main() {
    console.log('[Prometheus] Content script initialized');
    
    // Charger les paramètres
    const settings = await loadSettings();
    
    // Vérifier si le domaine actuel est désactivé
    const currentHostname = window.location.hostname;
    if (isDomainDisabled(currentHostname, settings.disabledDomains)) {
      console.log('[Prometheus] Domain disabled, skipping:', currentHostname);
      return;
    }
    
    // Initialiser le tracking des clics
    const cleanupTracking = initLinkTracking();
    
    // Fonction pour analyser et afficher le panneau
    async function analyzePage() {
      try {
        // Extraire les liens éligibles
        const eligibleLinks = await extractEligibleLinks(
          settings.blacklist,
          DEFAULT_DISPLAY_COUNT
        );
        
        console.log('[Prometheus] Eligible links found:', eligibleLinks.length);
        
        // Si aucun lien éligible, ne rien afficher
        if (eligibleLinks.length === 0) {
          hidePanel();
          return;
        }
        
        // Créer le panneau avec les callbacks
        createPanel(eligibleLinks, {
          onLinkHovered: (url, index) => {
            showIframe(index);
          },
          onLinkUnhovered: () => {
            hideIframes();
          },
          onLinkClicked: (url) => {
            navigateWithTransition(url);
          },
          onLinkBlacklisted: async (url) => {
            console.log('[Prometheus] Link blacklisted:', url);
            // Réanalyser la page après blacklist
            await analyzePage();
          },
        });
        
        // Précharger les URLs selon la limite
        preloadUrls(eligibleLinks, settings.maxPreloadPerPage);
        
      } catch (error) {
        console.error('[Prometheus] Error analyzing page:', error);
      }
    }
    
    // Analyser la page au chargement
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', analyzePage);
    } else {
      await analyzePage();
    }
    
    // Capturer un screenshot après le chargement complet de la page
    async function capturePageScreenshot() {
      try {
        const currentUrl = normalizeUrl(window.location.href);
        
        // Attendre un peu que la page se stabilise visuellement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Envoyer un message au background script pour capturer
        const response = await browser.runtime.sendMessage({
          type: 'capture-screenshot',
          url: currentUrl,
        }) as CaptureScreenshotResponse;
        
        if (response.success && response.dataUrl) {
          await saveScreenshot(currentUrl, response.dataUrl);
          console.log('[Prometheus] Screenshot captured for:', currentUrl);
        } else {
          console.warn('[Prometheus] Screenshot capture failed:', response.error);
        }
      } catch (error) {
        console.error('[Prometheus] Error capturing screenshot:', error);
      }
    }
    
    // Capturer le screenshot après le chargement complet
    if (document.readyState === 'complete') {
      capturePageScreenshot();
    } else {
      window.addEventListener('load', capturePageScreenshot);
    }
    
    // Observer les changements du DOM pour les SPAs
    const cleanupObserver = observeDOMChanges(() => {
      // Debounce pour éviter trop d'analyses
      setTimeout(analyzePage, 500);
    });
    
    // Nettoyage à la fermeture
    window.addEventListener('beforeunload', () => {
      cleanupTracking();
      cleanupObserver();
      hidePanel();
    });
  },
});
