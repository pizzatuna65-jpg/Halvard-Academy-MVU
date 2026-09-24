// Minimal Tavern Helper mock for previewing UI files in a plain browser.
window.__MOCK_STATE = window.__MOCK_STATE || {};
window._ = window._ || { debounce: (f) => f, get: (o, p, d) => { const r = String(p).split('.').reduce((a, k) => a == null ? a : a[k], o); return r === undefined ? d : r; }, cloneDeep: o => JSON.parse(JSON.stringify(o)), isEqual: (a, b) => JSON.stringify(a) === JSON.stringify(b) };
window.getCurrentMessageId = () => 3;
window.getLastMessageId = () => 3;
window.getChatMessages = () => [];
window.getVariables = () => ({ stat_data: window.__MOCK_STATE });
window.tavern_events = { MESSAGE_RECEIVED: 'mr', CHAT_CHANGED: 'cc' };
window.eventOn = () => {}; window.eventEmit = (e, d) => console.log('emit', e, d);
window.waitGlobalInitialized = () => new Promise(() => {});
window.toastr = { info: (m) => console.log('toast', m), warning: (m) => console.log('warn', m) };
window.SillyTavern = { getCurrentChatId: () => 'preview' };
