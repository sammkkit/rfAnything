(function() {
  const domain = location.hostname;

  function removeSavedSelectors(selectors) {
    if (!Array.isArray(selectors)) return;
    for (const sel of selectors) {
      try {
        const nodes = document.querySelectorAll(sel);
        console.log(`[rfAnything] Trying to remove ${sel}, found ${nodes.length}`);
        nodes.forEach(n => n.remove());
      } catch (err) {
        console.warn(`[rfAnything] Invalid selector: ${sel}`, err);
      }
    }
  }
  

  function run() {
    chrome.storage.local.get([domain], (data) => {
      const selectors = data[domain] || [];
      if (!selectors.length) return;
      // Try immediately
      removeSavedSelectors(selectors);
      // Also observe for dynamically added elements for a short while
      const obs = new MutationObserver(() => removeSavedSelectors(selectors));
      obs.observe(document.documentElement, { subtree: true, childList: true });
      setTimeout(() => obs.disconnect(), 5000);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
})();


