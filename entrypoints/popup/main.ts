import './style.css';
import { loadSettings, saveSettings, resetSettings } from '@/src/lib/storage';
import type { PrometheusSettings } from '@/src/lib/types';

// Éléments du DOM
let maxPreloadInput: HTMLInputElement;
let disabledDomainsContainer: HTMLElement;
let blacklistContainer: HTMLElement;
let newDomainInput: HTMLInputElement;
let newBlacklistInput: HTMLInputElement;
let addDomainBtn: HTMLButtonElement;
let addBlacklistBtn: HTMLButtonElement;
let saveBtn: HTMLButtonElement;
let resetBtn: HTMLButtonElement;
let statusDiv: HTMLElement;

// État actuel
let currentSettings: PrometheusSettings;

/**
 * Initialise les références aux éléments du DOM
 */
function initElements() {
  maxPreloadInput = document.getElementById('maxPreload') as HTMLInputElement;
  disabledDomainsContainer = document.getElementById('disabledDomains') as HTMLElement;
  blacklistContainer = document.getElementById('blacklist') as HTMLElement;
  newDomainInput = document.getElementById('newDomain') as HTMLInputElement;
  newBlacklistInput = document.getElementById('newBlacklist') as HTMLInputElement;
  addDomainBtn = document.getElementById('addDomain') as HTMLButtonElement;
  addBlacklistBtn = document.getElementById('addBlacklist') as HTMLButtonElement;
  saveBtn = document.getElementById('save') as HTMLButtonElement;
  resetBtn = document.getElementById('reset') as HTMLButtonElement;
  statusDiv = document.getElementById('status') as HTMLElement;
}

/**
 * Affiche un message de statut
 */
function showStatus(message: string, type: 'success' | 'error') {
  statusDiv.textContent = message;
  statusDiv.className = `status show ${type}`;
  
  setTimeout(() => {
    statusDiv.classList.remove('show');
  }, 3000);
}

/**
 * Rend la liste des domaines désactivés
 */
function renderDisabledDomains() {
  if (currentSettings.disabledDomains.length === 0) {
    disabledDomainsContainer.innerHTML = '<div class="empty-state">Aucun domaine désactivé</div>';
    return;
  }
  
  disabledDomainsContainer.innerHTML = currentSettings.disabledDomains
    .map((domain, index) => `
      <div class="list-item">
        <span class="list-item-text">${domain}</span>
        <button class="list-item-remove" data-type="domain" data-index="${index}">Retirer</button>
      </div>
    `)
    .join('');
  
  // Ajouter les event listeners
  disabledDomainsContainer.querySelectorAll('.list-item-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveItem);
  });
}

/**
 * Rend la liste des liens blacklistés
 */
function renderBlacklist() {
  if (currentSettings.blacklist.length === 0) {
    blacklistContainer.innerHTML = '<div class="empty-state">Aucun lien blacklisté</div>';
    return;
  }
  
  blacklistContainer.innerHTML = currentSettings.blacklist
    .map((url, index) => `
      <div class="list-item">
        <span class="list-item-text">${url}</span>
        <button class="list-item-remove" data-type="blacklist" data-index="${index}">Retirer</button>
      </div>
    `)
    .join('');
  
  // Ajouter les event listeners
  blacklistContainer.querySelectorAll('.list-item-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveItem);
  });
}

/**
 * Gère la suppression d'un élément de liste
 */
function handleRemoveItem(event: Event) {
  const btn = event.target as HTMLButtonElement;
  const type = btn.dataset.type;
  const index = parseInt(btn.dataset.index || '0', 10);
  
  if (type === 'domain') {
    currentSettings.disabledDomains.splice(index, 1);
    renderDisabledDomains();
  } else if (type === 'blacklist') {
    currentSettings.blacklist.splice(index, 1);
    renderBlacklist();
  }
}

/**
 * Ajoute un domaine désactivé
 */
function handleAddDomain() {
  const domain = newDomainInput.value.trim();
  
  if (!domain) {
    showStatus('Veuillez entrer un domaine', 'error');
    return;
  }
  
  if (currentSettings.disabledDomains.includes(domain)) {
    showStatus('Ce domaine est déjà dans la liste', 'error');
    return;
  }
  
  currentSettings.disabledDomains.push(domain);
  newDomainInput.value = '';
  renderDisabledDomains();
}

/**
 * Ajoute un lien à la blacklist
 */
function handleAddBlacklist() {
  const url = newBlacklistInput.value.trim();
  
  if (!url) {
    showStatus('Veuillez entrer une URL', 'error');
    return;
  }
  
  if (currentSettings.blacklist.includes(url)) {
    showStatus('Cette URL est déjà dans la liste', 'error');
    return;
  }
  
  currentSettings.blacklist.push(url);
  newBlacklistInput.value = '';
  renderBlacklist();
}

/**
 * Sauvegarde les paramètres
 */
async function handleSave() {
  try {
    // Récupérer la valeur du nombre max de préchargement
    const maxPreload = parseInt(maxPreloadInput.value, 10);
    
    if (isNaN(maxPreload) || maxPreload < 1 || maxPreload > 10) {
      showStatus('Le nombre doit être entre 1 et 10', 'error');
      return;
    }
    
    currentSettings.maxPreloadPerPage = maxPreload;
    
    // Sauvegarder
    await saveSettings(currentSettings);
    showStatus('Paramètres enregistrés !', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Erreur lors de la sauvegarde', 'error');
  }
}

/**
 * Réinitialise les paramètres
 */
async function handleReset() {
  if (!confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) {
    return;
  }
  
  try {
    currentSettings = await resetSettings();
    loadUI();
    showStatus('Paramètres réinitialisés !', 'success');
  } catch (error) {
    console.error('Error resetting settings:', error);
    showStatus('Erreur lors de la réinitialisation', 'error');
  }
}

/**
 * Charge l'interface avec les paramètres actuels
 */
function loadUI() {
  maxPreloadInput.value = String(currentSettings.maxPreloadPerPage);
  renderDisabledDomains();
  renderBlacklist();
}

/**
 * Initialise le popup
 */
async function init() {
  initElements();
  
  // Charger les paramètres
  currentSettings = await loadSettings();
  loadUI();
  
  // Event listeners
  addDomainBtn.addEventListener('click', handleAddDomain);
  addBlacklistBtn.addEventListener('click', handleAddBlacklist);
  saveBtn.addEventListener('click', handleSave);
  resetBtn.addEventListener('click', handleReset);
  
  // Permettre d'ajouter avec Enter
  newDomainInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddDomain();
  });
  
  newBlacklistInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddBlacklist();
  });
}

// Démarrer l'initialisation
init();
