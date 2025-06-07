// dialog elements
const dialog = document.getElementById("dialog");
const dialogCancelBtn = document.getElementById("dialogButtonCancel");
const dialogSaveBtn = document.getElementById("dialogButtonSave");
const dialogHeading = document.getElementById("dialogHeading");
const dialogPera = document.getElementById("dialogPera");

// dialog input filename elements
const fileNameInput = document.getElementById("dialogFileNameInput");
const fileNameOutput = document.getElementById("dialogFileNameOutput");

// create file elements
const createNewFileBtn = document.getElementById("createNewFile");

//get current excalidraw data
const getCurrentExcalidrawData = async () => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => localStorage.getItem("excalidraw"),
    });

    const drawingData = results[0]?.result;
    if (!drawingData) {
      alert("No Excalidraw data found in current tab.");
      return;
    }

    return drawingData;
  } catch (error) {
    alert("Error during geting data: " + error.message);
    return;
  }
};

// get excalidraw data using file name
const getCurrentExcalidrawDataUsingFilename = async (filename) => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => localStorage.getItem(filename),
    });

    const drawingData = results[0]?.result;
    if (!drawingData) {
      alert("No Excalidraw data found");
      return;
    }

    return drawingData;
  } catch (error) {
    alert("Error during geting data: " + error.message);
    return;
  }
};

// save data of file in local
const saveDataInLocal = async (filename, data) => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      args: [filename, data],
      func: (filename, data) => {
        localStorage.setItem(filename, data);
      },
    });
  } catch (error) {
    alert("Error during saving data: " + error.message);
  }
};

// set file data to current excalidraw
const setDataToExcalidraw = async () => {
  try {
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// get opened file
const getOpendFile = async () => {
  try {
    const filename = localStorage.getItem("openedFile");
    if (!filename) {
      return;
    }
    return filename;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// save filename that opened
const setOpendFile = async (filename) => {
  try {
    localStorage.setItem("openedFile", filename);
    return;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// set file changed or not
const setFileChanged = async (filename) => {
  try {
    localStorage.setItem("changedFile", filename);
    return;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// get file changed file
const getFileChanged = async () => {
  try {
    const filename = localStorage.getItem("changedFile");
    return filename;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// remove changed file
const removeFileChanged = async () => {
  try {
    localStorage.removeItem("changedFile");
    return;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// slugify the file name
const slugify = (input) => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[@]/g, "at")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
};

//create new file clickc
createNewFileBtn.onclick = async () => {
  // check current file is changed or not
  const currentFile = await getOpendFile();
  if (currentFile) {
    const fileChanged = await getFileChanged();
    if (fileChanged) {
      // show save file
      dialog.classList.add("showDialog");
      fileNameInput.value = fileChanged;
      fileNameOutput.textContent = slugify(fileChanged);
    }
  } else {
    // show create file dialog
    dialogHeading.textContent = "Create File";
    dialogPera.textContent = "create new file";
    dialogSaveBtn.textContent = "Create";
    dialog.classList.add("showDialog");
  }
};

fileNameInput.addEventListener("input", () => {
  fileNameOutput.textContent = slugify(fileNameInput.value);
});

dialogCancelBtn.onclick = async () => {
  dialog.classList.remove("showDialog");
};

dialogSaveBtn.onclick = async () => {};
