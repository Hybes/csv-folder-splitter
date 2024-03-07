const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { processFiles } = require('./processFiles'); // Adjust the path as necessary
const path = require('path');

try {
  require('electron-reloader')(module)
} catch (_) {}

ipcMain.on('start-processing', async (event, { csvFilePath, inputFolder }) => {
    const sortedFolder = `${inputFolder}-sorted-${Date.now()}`;
  try {
    await processFiles(csvFilePath, inputFolder, sortedFolder);
    event.sender.send('processing-complete', 'Done');
  } catch (error) {
    event.reply('processing-error', error.message);
  }
});

ipcMain.on('open-directory-dialog', (event) => {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      event.sender.send('selected-directory', result.filePaths[0]);
    }
  }).catch(err => {
    console.log(err);
  });
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

app.setName('CSV File Splitter');
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.