import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Prometheus',
    description: 'Extension de prévisualisation intelligente des liens les plus visités',
    permissions: ['storage', 'tabs', 'activeTab'],
    host_permissions: ['<all_urls>'],
  },
});
