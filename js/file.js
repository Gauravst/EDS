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

// file list elements
const filesContentUl = document.getElementById("filesContentUl");

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
      return "[]";
    }

    console.log("data", drawingData);
    console.log(typeof drawingData);
    return drawingData;
  } catch (error) {
    alert("Error during geting data: " + error.message);
    return;
  }
};

// get excalidraw data using file name
const getExcalidrawDataUsingFilename = async (filename) => {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => localStorage.getItem(filename),
    });

    const drawingData = results[0]?.result;
    console.log("drawingData", drawingData);
    if (!drawingData || drawingData == null) {
      return "[]";
    }

    console.log("hit");
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
const setDataToExcalidraw = async (data) => {
  try {
    await chrome.storage.local.set({ excalidrawRestoreData: data });
    const targetUrl = "https://excalidraw.com";

    // Promisify chrome.tabs.query
    const tabs = await new Promise((resolve) => {
      chrome.tabs.query({}, resolve);
    });

    const tab = tabs.find((t) => t.url && t.url.includes(targetUrl));

    if (tab) {
      await new Promise((resolve) => {
        chrome.tabs.reload(tab.id, resolve);
      });

      await new Promise((resolve) => {
        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === "complete") {
            chrome.scripting
              .executeScript({
                target: { tabId },
                files: ["inject-restore.js"],
              })
              .then(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
              })
              .catch((error) => {
                console.error("Script injection failed:", error);
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
              });
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    } else {
      const newTab = await new Promise((resolve) => {
        chrome.tabs.create({ url: targetUrl }, resolve);
      });

      await new Promise((resolve) => {
        const listener = (tabId, info) => {
          if (tabId === newTab.id && info.status === "complete") {
            chrome.scripting
              .executeScript({
                target: { tabId },
                files: ["inject-restore.js"],
              })
              .then(() => {
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
              })
              .catch((error) => {
                console.error("Script injection failed:", error);
                chrome.tabs.onUpdated.removeListener(listener);
                resolve();
              });
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });
    }
  } catch (error) {
    console.error("Error in setDataToExcalidraw:", error);
    alert("Error : " + error.message);
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

// get opened file pre changed data
const getPreChangeData = async () => {
  try {
    const data = localStorage.getItem("preData");
    return data;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// set opened file pre data
const setPreData = async (data) => {
  try {
    localStorage.setItem("preData", data);
    return;
  } catch (error) {
    alert("Error : " + error.message);
    return;
  }
};

// check opened file changed or not
const openedFileChanged = async (btn) => {
  const intervalId = setInterval(async () => {
    const preChangeData = await getPreChangeData();
    const postChangeData = await getCurrentExcalidrawData();

    if (preChangeData != postChangeData) {
      btn.classList.remove("hideSaveBtn");
      clearInterval(intervalId);
    }
  }, 1000);
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

// create new file
const createNewFile = async (filename) => {
  try {
    // get files data
    const data = localStorage.getItem("files");
    const files = JSON.parse(data) || [];

    // set new file in data & save
    const newFile = { name: filename };
    files.unshift(newFile);
    localStorage.setItem("files", JSON.stringify(files));

    // set new file as opened file
    await setOpendFile(filename);

    // save new file data
    await saveDataInLocal(filename, "[]");
    return files;
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

// render file list
const renderFileList = async (files) => {
  files.map(async (item) => {
    // list element of file
    const li = document.createElement("li");
    li.classList.add("fileListItem", "flex");

    const openedFile = await getOpendFile();
    if (openedFile === item.name) {
      li.classList.add("fileListItemSeleted");
    }

    // file list click
    li.addEventListener("click", async () => {
      // open the file
      const changedFile = await getFileChanged();
      const openedFile = await getOpendFile();
      const fileNewData = await getCurrentExcalidrawData();
      if (openedFile != item.name) {
        if (changedFile === item.name) {
          // show save dialog
          alert("file save first that switch to new file");
        } else {
          const fileData = await getExcalidrawDataUsingFilename(item.name);
          if (!fileData) return;
          await setOpendFile(item.name);
          await removeFileChanged();
          await setPreData(fileData);
          await setDataToExcalidraw(fileData);
        }
      }
      return;
    });

    // image of file logo in list
    const imgFile = document.createElement("img");
    imgFile.src = "icons/file.svg";

    // name of file
    const fileName = document.createElement("p");
    fileName.textContent = item.name;

    // button div element
    const btnDiv = document.createElement("div");
    btnDiv.classList.add("fileListItemButtons");

    // button element
    const imgBtn = document.createElement("img");
    imgBtn.src = "icons/save.svg";
    if (openedFile != item.name) {
      imgBtn.classList.add("hideSaveBtn");
    }

    // save current file
    imgBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      // save the file
      const changedFile = await getFileChanged();
      const openedFile = await getOpendFile();
      const fileNewData = await getCurrentExcalidrawData();
      if (openedFile == item.name && changedFile == item.name) {
        await saveDataInLocal(item.name, fileNewData);
      }
      return;
    });

    const changedFile = await getFileChanged();
    if (changedFile != item.name) {
      imgBtn.classList.add("hideSaveBtn");
    }

    // adding all element to li (list element)
    btnDiv.appendChild(imgBtn);
    li.appendChild(imgFile);
    li.appendChild(fileName);
    li.appendChild(btnDiv);

    filesContentUl.appendChild(li);
  });
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
      return;
    }
  }
  // show create file dialog
  dialogHeading.textContent = "Create File";
  dialogPera.textContent = "Start a new excalidraw file";
  dialogSaveBtn.textContent = "Create";
  dialog.classList.add("showDialog");
};

fileNameInput.addEventListener("input", () => {
  fileNameOutput.textContent = slugify(fileNameInput.value);
});

dialogCancelBtn.onclick = async () => {
  dialog.classList.remove("showDialog");
};

// dialog save/ok/create btn click
dialogSaveBtn.onclick = async () => {
  const btnType = dialogSaveBtn.textContent;
  if (btnType === "Save") {
    // get data
    const data = await getCurrentExcalidrawData();
    if (!data) return;

    // get filename
    const filename = await getOpendFile();
    if (!filename) return;

    // save data
    await saveDataInLocal(filename, data);

    // close dialog
    dialog.classList.remove("showDialog");
    return;
  } else if (btnType === "Create") {
    // create new file
    const files = await createNewFile(slugify(fileNameInput.value));

    // update in ui
    await renderFileList(files);

    // close dialog
    dialog.classList.remove("showDialog");

    const data = [];

    // set in preData
    await setPreData(data);

    // set in excalidraw
    await setDataToExcalidraw(data);
    return;
  }
};

// load files data in ui on start
(async () => {
  const data = localStorage.getItem("files");
  const files = JSON.parse(data);
  if (files) {
    await renderFileList(files);
  } else {
    const infoPera = document.createElement("p");
    infoPera.classList.add("infoPera");
    infoPera.textContent =
      "No file available. Create a new file by clicking the + icon.";

    filesContentUl.appendChild(infoPera);
  }
})();
