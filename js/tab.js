// backup tab clicked - show backup page
const backupTabClicked = async () => {
  localStorage.setItem("tab", "backup");
  backupTab.classList.add("selectedTab");
  fileTab.classList.remove("selectedTab");
  backupContent.classList.add("showContent");
  backupContent.classList.remove("removeContent");
  filesContent.classList.add("removeContent");
  filesContent.classList.remove("showContent");
};

// file tab clicked - show file page
const fileTabClicked = async () => {
  localStorage.setItem("tab", "file");
  fileTab.classList.add("selectedTab");
  backupTab.classList.remove("selectedTab");
  filesContent.classList.add("showContent");
  filesContent.classList.remove("removeContent");
  backupContent.classList.add("removeContent");
  backupContent.classList.remove("showContent");
};

// set last open tab on start
(async () => {
  const tab = localStorage.getItem("tab");
  if (tab === "file") {
    await fileTabClicked();
  }
})();

// backup tab btn click
backupTab.onclick = async () => {
  await backupTabClicked();
};

// file tab btn click
fileTab.onclick = async () => {
  await fileTabClicked();
};
