# EDS — Excalidraw Data Sync

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Status](https://img.shields.io/badge/status-Stable-green)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**Backup and Manage multiple file of your Excalidraw drawings effortlessly**

> ☁️ Uses GitHub as cloud storage — no backend needed!

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [How to create a GitHub Personal Access Token (PAT)](#how-to-create-a-github-personal-access-token-pat)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Overview

EDS is a simple **Chrome extension** that lets you create, save, and manage multiple Excalidraw drawings and Backup directly in your GitHub repository — no backend required.

Each user uses their own GitHub Personal Access Token to save and load data securely.

> **Note:** This is an independent tool and is not affiliated with the official [Excalidraw](https://github.com/excalidraw/excalidraw) project.

## Features

- Create and manage multiple Excalidraw files
- Save Excalidraw drawing JSON data to your GitHub repo
- Restore drawings from GitHub
- No backend hosting required
- Works with private or public GitHub repos

## Installation

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select this project folder.
5. The EDS extension icon will appear next to the address bar.

## Usage

1. Click the EDS icon.
2. Enter your GitHub Personal Access Token (PAT) with appropriate repository permissions.
3. Enter your GitHub repo details (owner, repo name, file path).
4. Use **Save Drawing** to back up your current Excalidraw drawing.
5. Use **Load Drawing** to restore a saved drawing.
6. Create and manage multiple file in files Tab.

## How to create a GitHub Personal Access Token (PAT)

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens > Fine-grained tokens](https://github.com/settings/tokens).
2. Click **Generate new token** and choose **Fine-grained token**.
3. Under **Repository access**, select **Only select repositories** and choose the repo(s) you want to allow EDS to access.
4. Under **Permissions**, expand **Contents** and set it to **Read and write** for saving and restoring drawings.
5. Generate the token and **copy it**.
6. Paste the token into the EDS extension UI when prompted.

## Contributing

Contributions are welcome and appreciated! 🙌

#### For small fixes:

Feel free to open a pull request directly.

#### For larger changes:

Please [open an issue](https://github.com/gauravst/eds/issues) first to discuss what you plan to do. This helps avoid duplicated work and ensures your idea fits the project direction.

If you'd like to help improve EDS, follow these steps:

1. **Fork the repository**
2. **Create a new branch**  
   `git checkout -b feat/feature-name`
3. **Make your changes**
4. **Commit with a clear message**  
   `git commit -m "feat: new feature"`
5. **Push to your fork**  
   `git push origin feature-name`
6. **Open a Pull Request** with a short description

Please make sure your code is clean and easy to understand.  
If you're not sure about something, open an issue first to discuss it.

📄 Read the [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for full license text.

## Acknowledgements

🖊️ [Excalidraw](https://github.com/excalidraw/excalidraw) is a wonderful open-source drawing tool.  
EDS is built to support Excalidraw's `.json` format and help users back up their work.  
Excalidraw is licensed under the [MIT License](https://github.com/excalidraw/excalidraw/blob/master/LICENSE).
