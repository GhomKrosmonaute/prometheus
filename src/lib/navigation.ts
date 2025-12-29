/**
 * Gestion de la navigation avec transition
 */

/**
 * Navigue vers une URL avec une animation de transition
 */
export function navigateWithTransition(url: string): void {
  const container = document.getElementById('prometheus-container');
  
  if (container) {
    // Ajouter la classe d'animation
    container.classList.add('prometheus-transitioning');
    
    // Attendre la fin de l'animation avant de naviguer
    setTimeout(() => {
      window.location.href = url;
    }, 400); // Durée de l'animation
  } else {
    // Pas d'animation, navigation directe
    window.location.href = url;
  }
}

/**
 * Ouvre une URL dans un nouvel onglet
 */
export function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Vérifie si un clic doit ouvrir dans un nouvel onglet
 */
export function shouldOpenInNewTab(event: MouseEvent): boolean {
  return event.ctrlKey || event.metaKey || event.button === 1; // Ctrl/Cmd ou clic molette
}

