  // 1.25.0 (owner, planning/DRAFT_proficiency_practice.md Batch 1): red "new" dots. Shared by the bracelet and the panels
  // (tools/gen_ui.py pastes this file into both). What was seen is not game state: it lives in Tavern Helper's chat variables
  // (chat_metadata.variables, saved with the chat; MVU only writes its own keys there), never in the message variables or the
  // browser (DECISIONS §6, §11). The panels write it; the bracelet only reads it.
  // An item is [key, panel]. Two levels: a panel button's dot goes once the panel is opened ("noticed"); an item's dot goes once
  // the item itself is shown ("seen").
  const NEWS_VAR = 'eld_seen';
  function newsItems(S, featOn) {
    const ui = (S && S.$ui) || {}, unl = ui.unlocks || [], out = [];
    const tab = (panel, id, ok) => { if (ok) out.push(['tab:' + panel + ':' + id, panel]); };
    const f = id => featOn(id), u = k => unl.includes(k);
    tab('notebook', 'notices', u('notices') && (f('notices') || f('weather')));
    tab('notebook', 'letters', u('letters') && f('letters'));
    tab('notebook', 'mystery', u('mystery') && f('mystery'));
    tab('activities', 'competition', u('competition') && f('competition'));
    tab('activities', 'projects', u('projects') && f('projects'));
    tab('activities', 'trip', u('trip') && f('trip'));
    tab('profile', 'bag', u('inventory') && f('inventory'));
    tab('profile', 'hidden', !!((S && S.Hidden) || {})._True_magic || u('hidden'));
    tab('profile', 'perks', Object.keys((S && S._Perks) || {}).length > 0 || (ui.perks_used || []).length > 0);
    (ui.lore || []).forEach(x => out.push(['lore:' + x, 'map']));
    Object.keys((S && S.Bonds) || {}).forEach(id => out.push(['npc:' + id, 'people']));
    return out;
  }
  function newsStore() {
    try { const v = (getVariables({ type: 'chat' }) || {})[NEWS_VAR]; return v && Array.isArray(v.seen) ? v : null; } catch (e) { return null; }
  }
  // keys not yet seen; with `panels`, the panels holding one that is not noticed either (the bracelet buttons)
  function newsUnseen(S, featOn, st) {
    if (!S || !st) return [];
    const seen = new Set(st.seen);
    return newsItems(S, featOn).filter(([k]) => !seen.has(k));
  }
  function newsPanels(S, featOn, st) {
    const noticed = new Set((st && st.noticed) || []);
    return new Set(newsUnseen(S, featOn, st).filter(([k]) => !noticed.has(k)).map(([, p]) => p));
  }
  const newsDot = label => '<i class="nd" role="img" aria-label="' + (label ? label + ', ' : '') + 'new" title="New"></i>';
