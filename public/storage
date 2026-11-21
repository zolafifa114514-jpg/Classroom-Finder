const ClassroomStorage = (() => {
  const key = 'classroom-finder-v1';
  const sample = {
    recentSearches: [],
    officialLandmarks: ['Main Entrance', 'Library Entrance', 'North Stairwell']
  };
  function load() {
    try { return { ...sample, ...JSON.parse(localStorage.getItem(key) || '{}') }; }
    catch { return { ...sample }; }
  }
  function save(value) { localStorage.setItem(key, JSON.stringify(value)); }
  function addSearch(room, start) {
    const state = load();
    state.recentSearches = [{ room, start }, ...state.recentSearches.filter((item) => item.room !== room || item.start !== start)].slice(0, 5);
    save(state);
  }
  return { load, addSearch };
})();
