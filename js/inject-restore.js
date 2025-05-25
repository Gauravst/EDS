(() => {
  chrome.storage.local.get("excalidrawRestoreData", (result) => {
    const data = result.excalidrawRestoreData;
    if (data) {
      localStorage.setItem("excalidraw", data);
      chrome.storage.local.remove("excalidrawRestoreData");
    }
  });
})();
