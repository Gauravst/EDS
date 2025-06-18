// backup and restore elements
const tokenInput = document.getElementById("token");
const repoInput = document.getElementById("repo");
const backupBtn = document.getElementById("backup");
const fetchRestoreBtn = document.getElementById("fetchRestore");
const restoreBtn = document.getElementById("restore");
const versionsSelect = document.getElementById("versions");

// tab elements
const backupTab = document.getElementById("backupTab");
const fileTab = document.getElementById("fileTab");
const backupContent = document.getElementById("backupContent");
const filesContent = document.getElementById("filesContent");

const filename = "eds-backup.json";

const setLoading = (isLoading) => {
  backupBtn.disabled = isLoading;
  restoreBtn.disabled = isLoading;
  tokenInput.disabled = isLoading;
  repoInput.disabled = isLoading;
  versionsSelect.disabled = isLoading;
};

const clearVersions = () => {
  versionsSelect.innerHTML = '<option value="">Select a version</option>';
};

const isValidInput = (token, repo) => {
  return token && repo;
};

const getSha = async (token, repo, path) => {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        headers: { Authorization: `token ${token}` },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha;
  } catch {
    return null;
  }
};

const saveTokenAndRepo = async (token, repo) => {
  const existingToken = localStorage.getItem("githubToken");
  const existingRepo = localStorage.getItem("githubRepo");

  if (existingToken !== token) localStorage.setItem("githubToken", token);
  if (existingRepo !== repo) localStorage.setItem("githubRepo", repo);
};

// Load saved values
const existingToken = localStorage.getItem("githubToken");
const existingRepo = localStorage.getItem("githubRepo");

if (existingToken) tokenInput.value = existingToken;
if (existingRepo) repoInput.value = existingRepo;

backupBtn.onclick = async () => {
  backupBtn.innerText = "Loading...";
  backupBtn.disabled = true;
  const token = tokenInput.value.trim();
  const repo = repoInput.value.trim();

  if (!token || !repo) {
    alert("Token and repo required");
    return;
  }

  setLoading(true);
  await saveTokenAndRepo(token, repo);

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => localStorage.getItem("excalidraw"),
    });

    const drawingData = results[0]?.result;
    if (!drawingData) {
      alert("No Excalidraw data found in current tab.");
      setLoading(false);
      backupBtn.innerText = "Backup Drawing";
      backupBtn.disabled = false;
      return;
    }
    console.log("backupBtn click data =--", drawingData);

    const sha = await getSha(token, repo, filename);

    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Backup on ${new Date().toLocaleString()}`,
          content: btoa(unescape(encodeURIComponent(drawingData))),
          sha: sha || undefined,
        }),
      },
    );

    const result = await res.json();
    if (res.ok) {
      alert("Backup saved to GitHub!");
      backupBtn.innerText = "Backup Drawing";
      backupBtn.disabled = false;
    } else {
      alert("Failed to save backup: " + (result.message || "Unknown error"));
      backupBtn.innerText = "Backup Drawing";
      backupBtn.disabled = false;
    }
  } catch (err) {
    alert("Error during backup: " + err.message);
  }
  setLoading(false);
};

fetchRestoreBtn.onclick = async () => {
  const token = tokenInput.value.trim();
  const repo = repoInput.value.trim();
  clearVersions();

  if (!isValidInput(token, repo)) return;
  await saveTokenAndRepo(token, repo);

  setLoading(true);
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?path=${filename}`,
      {
        headers: { Authorization: `token ${token}` },
      },
    );

    if (!res.ok) {
      alert("Failed to fetch versions from GitHub.");
      setLoading(false);
      return;
    }

    const commits = await res.json();

    commits.forEach((commit) => {
      const option = document.createElement("option");
      option.value = commit.sha;
      option.textContent = `${commit.commit.message}`;
      versionsSelect.appendChild(option);
    });
  } catch (err) {
    alert("Error fetching versions: " + err.message);
  }
  setLoading(false);
};

restoreBtn.onclick = async () => {
  restoreBtn.innerText = "Loading...";
  restoreBtn.disabled = true;
  const token = tokenInput.value.trim();
  const repo = repoInput.value.trim();
  const commitSha = versionsSelect.value;

  if (!token || !repo || !commitSha) {
    alert("Please enter token, repo and select a version to restore.");
    restoreBtn.innerText = "Restore Drawing";
    restoreBtn.disabled = false;
    return;
  }

  setLoading(true);
  try {
    // 1. Get commit info
    const commitRes = await fetch(
      `https://api.github.com/repos/${repo}/git/commits/${commitSha}`,
      {
        headers: { Authorization: `token ${token}` },
      },
    );
    if (!commitRes.ok) throw new Error("Failed to get commit data");
    const commitData = await commitRes.json();
    const treeSha = commitData.tree.sha;

    // 2. Get tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${treeSha}?recursive=1`,
      {
        headers: { Authorization: `token ${token}` },
      },
    );
    if (!treeRes.ok) throw new Error("Failed to get tree");
    const treeData = await treeRes.json();

    const file = treeData.tree.find((f) => f.path === filename);
    if (!file) throw new Error("Backup file not found");

    // 3. Get blob
    const blobRes = await fetch(
      `https://api.github.com/repos/${repo}/git/blobs/${file.sha}`,
      {
        headers: { Authorization: `token ${token}` },
      },
    );
    if (!blobRes.ok) throw new Error("Failed to fetch blob");
    const blobData = await blobRes.json();

    const decoded = new TextDecoder().decode(
      Uint8Array.from(atob(blobData.content), (c) => c.charCodeAt(0)),
    );

    await chrome.storage.local.set({ excalidrawRestoreData: decoded });

    const targetUrl = "https://excalidraw.com";

    chrome.tabs.query({}, function (tabs) {
      const tab = tabs.find((t) => t.url && t.url.includes(targetUrl));
      if (tab) {
        chrome.tabs.reload(tab.id);

        const listener = (tabId, info) => {
          if (tabId === tab.id && info.status === "complete") {
            chrome.scripting.executeScript({
              target: { tabId },
              files: ["inject-restore.js"],
            });
            chrome.tabs.onUpdated.removeListener(listener);
          }
        };

        chrome.tabs.onUpdated.addListener(listener);
      } else {
        chrome.tabs.create({ url: targetUrl }, function (newTab) {
          const listener = (tabId, info) => {
            if (tabId === newTab.id && info.status === "complete") {
              chrome.scripting.executeScript({
                target: { tabId },
                files: ["inject-restore.js"],
              });
              chrome.tabs.onUpdated.removeListener(listener);
            }
          };

          chrome.tabs.onUpdated.addListener(listener);
        });
      }
    });

    restoreBtn.innerText = "Restore Drawing";
    restoreBtn.disabled = false;
  } catch (err) {
    alert("Error during restore: " + err.message);
    restoreBtn.innerText = "Restore Drawing";
    restoreBtn.disabled = false;
  }
  setLoading(false);
};
