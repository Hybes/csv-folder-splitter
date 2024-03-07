document.getElementById('startProcessing').addEventListener('click', () => {
  try {
    document.getElementById('status').textContent = 'Processing...';

    const csvFileElement = document.getElementById('csvFile');
    const folderInputElement = document.getElementById('folderInput');

    if (!csvFileElement || !csvFileElement.files.length || !folderInputElement || !folderInputElement.files.length) {
      console.error('No file selected or elements not found');
      return;
    }
    const csvFilePath = csvFileElement.files[0].path;

    if (!csvFilePath.endsWith('.csv')) {
      console.error('Invalid file type. Please select a CSV file.');
      return;
    }

    const folderPath = folderInputElement.files[0].path.replace(/\/[^\/]*$/, '');

    window.electron.send('start-processing', { csvFilePath, inputFolder: folderPath});
  } catch (error) {
    document.getElementById('status').textContent = 'Error...';
    console.error('Error sending start-processing message:', error);
  }
});

window.electron.receive('open-directory-dialog', () => {
  window.electron.send('selected-directory', (path) => {
    console.log('Selected folder:', path);
  });
});

window.electron.send('open-directory-dialog');

window.electron.receive('processing-complete', (message) => {
  document.getElementById('status').textContent = message.split('\n').pop();
});

window.electron.receive('processing-error', (error) => {
  console.error(error);
  document.getElementById('status').textContent = 'Error: ' + error;
});