(() => {
  if (window.__rfAnythingSelecting) {
    return;
  }
  window.__rfAnythingSelecting = true;

  const highlight = document.createElement('div');
  highlight.style.position = 'fixed';
  highlight.style.pointerEvents = 'none';
  highlight.style.zIndex = '2147483647';
  highlight.style.border = '2px solid #3b82f6';
  highlight.style.background = 'rgba(59, 130, 246, 0.1)';
  highlight.style.borderRadius = '4px';
  highlight.style.transition = 'all 40ms ease';
  document.documentElement.appendChild(highlight);

  const tooltip = document.createElement('div');
  tooltip.style.position = 'fixed';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.zIndex = '2147483647';
  tooltip.style.background = '#111827';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '4px 6px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';
  tooltip.style.fontSize = '12px';
  tooltip.textContent = 'Click to remove • Esc to exit';
  document.documentElement.appendChild(tooltip);

  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '12px';
  toast.style.right = '12px';
  toast.style.zIndex = '2147483647';
  toast.style.background = '#111827';
  toast.style.color = '#fff';
  toast.style.padding = '8px 10px';
  toast.style.borderRadius = '6px';
  toast.style.fontSize = '12px';
  toast.style.display = 'none';
  const undoBtn = document.createElement('button');
  undoBtn.textContent = 'Undo';
  undoBtn.style.marginLeft = '8px';
  undoBtn.style.cursor = 'pointer';
  undoBtn.style.background = '#2563eb';
  undoBtn.style.color = '#fff';
  undoBtn.style.border = '0';
  undoBtn.style.padding = '4px 8px';
  undoBtn.style.borderRadius = '4px';
  toast.append('Removed.', undoBtn);
  document.documentElement.appendChild(toast);

  let lastRemoved = null; // { parent, nextSibling, node }

  function showToast() {
    toast.style.display = 'block';
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  undoBtn.addEventListener('click', () => {
    if (lastRemoved && lastRemoved.parent && lastRemoved.node) {
      try {
        lastRemoved.parent.insertBefore(lastRemoved.node, lastRemoved.nextSibling || null);
      } catch {}
    }
    toast.style.display = 'none';
  });

  function getCssPath(el) {
    if (!(el instanceof Element)) return;
  
    const path = [];
    while (el.nodeType === Node.ELEMENT_NODE && el !== document.body) {
      let selector = el.nodeName.toLowerCase();
  
      // Skip random-looking IDs (UUIDs, long hashes)
      if (el.id && !/^[0-9a-f-]{10,}$/i.test(el.id)) {
        selector += `#${CSS.escape(el.id)}`;
        path.unshift(selector);
        break; // ID is enough to identify uniquely
      }
  
      // Use stable class names (avoid dynamic BEM or hash-like ones)
      if (el.classList.length > 0) {
        const cleanClasses = Array.from(el.classList).filter(
          c => !/^[0-9a-f-]{6,}$/i.test(c) && !c.startsWith("css-") && !c.includes("uuid")
        );
        if (cleanClasses.length > 0) {
          selector += '.' + cleanClasses.map(c => CSS.escape(c)).join('.');
        }
      }
  
      // Use nth-of-type to disambiguate siblings
      const sibling = el.parentNode?.children;
      if (sibling && Array.from(sibling).filter(n => n.nodeName === el.nodeName).length > 1) {
        const index = Array.from(sibling).indexOf(el) + 1;
        selector += `:nth-of-type(${index})`;
      }
  
      path.unshift(selector);
      el = el.parentNode;
    }
  
    return path.join(' > ');
  }
  

  function updateHighlight(target) {
    if (!(target instanceof Element)) {
      highlight.style.width = '0px';
      highlight.style.height = '0px';
      tooltip.style.display = 'none';
      return;
    }
    const rect = target.getBoundingClientRect();
    highlight.style.left = `${rect.left + window.scrollX - 2}px`;
    highlight.style.top = `${rect.top + window.scrollY - 2}px`;
    highlight.style.width = `${rect.width + 4}px`;
    highlight.style.height = `${rect.height + 4}px`;
    tooltip.style.display = 'block';
    const ttX = Math.min(window.scrollX + window.innerWidth - 200, Math.max(window.scrollX + 8, rect.left + window.scrollX + 8));
    const ttY = Math.max(window.scrollY + 8, rect.top + window.scrollY + 8);
    tooltip.style.left = `${ttX}px`;
    tooltip.style.top = `${ttY}px`;
  }

  function saveSelectorForDomain(selector) {
    const domain = location.hostname;
    chrome.storage.local.get([domain], (data) => {
      const list = Array.isArray(data[domain]) ? data[domain] : [];
      if (!list.includes(selector)) list.push(selector);
      chrome.storage.local.set({ [domain]: list });
    });
  }

  function onMouseMove(e) {
    updateHighlight(e.target);
  }

  function onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const target = e.target;
    if (!(target instanceof Element)) return;
    const selector = getCssPath(target);
    lastRemoved = { parent: target.parentNode, nextSibling: target.nextSibling, node: target };
    try { target.remove(); } catch {}
    saveSelectorForDomain(selector);
    showToast();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  function preventDefault(e) {
    e.preventDefault();
  }

  function cleanup() {
    window.removeEventListener('mousemove', onMouseMove, true);
    window.removeEventListener('click', onClick, true);
    window.removeEventListener('contextmenu', preventDefault, true);
    window.removeEventListener('keydown', onKeyDown, true);
    highlight.remove();
    tooltip.remove();
    toast.remove();
    window.__rfAnythingSelecting = false;
  }

  // Capture early to avoid page handlers
  window.addEventListener('mousemove', onMouseMove, true);
  window.addEventListener('click', onClick, true);
  window.addEventListener('contextmenu', preventDefault, true);
  window.addEventListener('keydown', onKeyDown, true);
})();


