/*global chrome*/

chrome.management.onInstalled.addListener(({ id }) => {
  chrome.runtime.sendMessage(id, { type: "action spec" }, spec =>
    storeActionSpec({ id, ...spec, installedAt: new Date().toISOString() })
  );
});

chrome.runtime.onMessageExternal.addListener((request, sender) => {
  console.debug("incoming external request: ", request)
  switch (request.type) {
    case "select": {
      chooseFrom(sender.id, request.hint, request.options);
    }
  }
});

function chooseFrom(senderId, hint, options) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "select", senderId, hint, options });
  });
}

function storeActionSpec(thisSpec) {
  if (
    thisSpec.id === undefined ||
    thisSpec.name === undefined ||
    thisSpec.actions === undefined
  )
    return;
  getActionSpecs(actionSpecs => {
    console.debug("---begin storeActionSpec---");
    console.debug(actionSpecs);
    const index = actionSpecs.findIndex(
      thatSpec => thisSpec.id === thatSpec.id
    );
    // If already there, updates the entry. Otherwise, newly adds it.
    if (index > -1) actionSpecs[index] = thisSpec;
    else actionSpecs.unshift(thisSpec);
    saveActionSpecs(actionSpecs);
    console.debug("---end storeActionSpec---");
  });
}

chrome.runtime.onInstalled.addListener(() => {
  getActionSpecs(actionSpecs => {
    const validSpecs = actionSpecs.filter(
      ({ id, name, actions }) =>
        id !== undefined && name !== undefined && actions !== undefined
    );
    console.debug(validSpecs);
    saveActionSpecs(validSpecs);
  });
});

function getActionSpecs(callback) {
  chrome.storage.sync.get({ actionSpecs: [] }, ({ actionSpecs }) =>
    callback(actionSpecs)
  );
}

function saveActionSpecs(actionSpecs) {
  chrome.storage.sync.set({ actionSpecs });
}

chrome.runtime.onConnect.addListener(({ name, onMessage }) => {
  if (name == "ActHub")
    onMessage.addListener(message => {
      console.log(message);
      console.log("Thanks, content.js -- received in background.js");
    });
});
