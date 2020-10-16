import equalsCaseInsensitively from "../util/compareCaseInsensitively";

export function extensionSpecToActions({ id, name, actions }) {
  return actions.map((action, index) => {
    return {
      key: `${id}-${index}`,
      extensionId: id,
      title: action.displayName || `${name}: ${action.name}`,
      action
    };
  });
}

// Sorts entries according to the match results of their titles
// against q.
export function searchEntries(entries, q) {
  const sorted = [];
  const ms = []; // Match results that represent ranks of entries

  for (const entry of entries) {
    const m = match(entry.title, q);
    if (m.length !== q.length) continue;
    for (
      var j = ms.length - 1;
      j >= 0 && (ms.length === 0 || lt(m, ms[j]));
      j--
    );
    ms.splice(j + 1, 0, m);
    sorted.splice(j + 1, 0, entry);
  }
  return sorted;
}

// Compute a match with minimum density.
function match(title, q) {
  const ts = Array.from(title);
  const qs = Array.from(q);
  const stacks = [{ next: 0, density: 0, length: 0 }];
  for (var i = 0; i < ts.length; i++) {
    var prevLen = -1;
    var stack;
    for (var j = 0; j < stacks.length; j++) {
      stack = stacks[j]
      if (stack.length === qs.length || !equalsCaseInsensitively(ts[i], qs[stack.next])) {
        prevLen = stack.length;
        continue;
      }
      if (stack.length === 0) {
        stack.position = i;
      } else {
        stack.density += i - stack.last;
      }
      stack.next += 1;
      stack.last = i;
      stack.length += 1;
      if (stack.length === prevLen) 
        stacks.splice(--j, 1);
      prevLen = stack.length;
    }
    if (stack.length !== 0)
      stacks.push({ next: 0, density: 0, length: 0 });
  }
  return stacks[0];
}

// Compares lexicographically.
const lt = (m, m1) => {
  if (m.length > m1.length) return true;
  else if (m.length < m1.length) return false;
  else {
    if (m.density < m1.density) return true;
    else if (m.density > m1.density) return false;
    else {
      if (m.position < m1.position) return true;
      else if (m.position > m1.position) return false;
      else return false;
    }
  }
};
