document.getElementById('startProcessing').addEventListener('click', () => {
  try {
    const csvFileElement = document.getElementById('csvFile');
    const folderInputElement = document.getElementById('folderInput'); // Move this line up

    // Check if files are selected
    if (!csvFileElement.files.length || !folderInputElement.files.length) {
      console.error('No file selected');
      return;
    }
    const csvFilePath = csvFileElement.files[0].path; // Get the path of the selected file

    // The check for folderInputElement.files.length is redundant here since it's checked above
    // Extract the folder path correctly before this point
    const folderPath = folderInputElement.files[0].path.replace(/\/[^\/]*$/, '');
    console.log('Folder Path:', folderPath);
    console.log('CSV File Path:', csvFilePath);

    // Assuming folderInputPath should be folderPath based on your context
    window.electron.send('start-processing', { csvFilePath, inputFolder: folderPath});
  } catch (error) {
    console.error('Error sending start-processing message:', error);
  }
});

window.electron.receive('open-directory-dialog', () => {
  window.electron.send('selected-directory', (path) => {
    console.log('Selected folder:', path);
  });
});

// Trigger the dialog open
window.electron.send('open-directory-dialog');

window.electron.receive('processing-complete', (message) => {
  console.log(message); // Or update the UI accordingly
});

window.electron.receive('processing-error', (error) => {
  console.error(error); // Or display the error in the UI
});