const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { once } = require('events');

async function processFiles(csvFilePath, inputFolder) {

  const sortedFolder = `${inputFolder}-sorted-${Date.now()}`;

  async function processFiles(csvFilePath, inputFolder, sortedFolder) {
    const csvFileStream = fs.createReadStream(csvFilePath);
    const rl = readline.createInterface({
      input: csvFileStream,
      crlfDelay: Infinity
    });

    const names = [];
    rl.on('line', (line) => {
      names.push(line.trim());
    });

    await once(rl, 'close');

    fs.readdir(inputFolder, async (err, files) => {
      if (err) throw err;

      // Ensure only .jpg files are processed
      const jpgFiles = files.filter(file => file.endsWith('.jpg'));

      // Sort files numerically based on the extracted number
      jpgFiles.sort((a, b) => {
        const numA = parseInt(a.match(/_(\d+)\.jpg$/)[1], 10);
        const numB = parseInt(b.match(/_(\d+)\.jpg$/)[1], 10);
        return numA - numB;
      });

      const copyOperations = jpgFiles.map((file, index) => {
        // Adjusted calculation for nameIndex to correctly map sets of four files to names
        const nameIndex = Math.floor(index / 4);
        if (nameIndex >= names.length) {
          console.warn(`Not enough names for file: ${file}. Skipping.`);
          return Promise.resolve(); // Skip files that exceed the number of names available
        }
        const counter = (index % 4) + 1;
        const name = names[nameIndex];
        const fileExt = path.extname(file);
        const oldPath = path.join(inputFolder, file);
        const destFolder = path.join(sortedFolder, name);
        const newPath = path.join(destFolder, `${name}-${counter}${fileExt}`);

        if (!fs.existsSync(destFolder)) {
          fs.mkdirSync(destFolder, { recursive: true });
        }

        return fs.promises.copyFile(oldPath, newPath)
          .then(() => `Copied "${oldPath}" -> "${newPath}"`)
          .catch((err) => Promise.reject(err));
      });

      // Wait for all copy operations to complete
      Promise.all(copyOperations)
        .then((results) => {
          results.forEach((result) => {
            if (result) console.log(result);
          });
        })
        .catch((error) => {
          console.error("An error occurred:", error);
        });
    });
  }

  processFiles(csvFilePath, inputFolder, sortedFolder).catch(console.error);
}

module.exports = { processFiles };