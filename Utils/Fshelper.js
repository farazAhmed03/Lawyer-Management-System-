
// utils/fsHelper.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Promisify required fs methods
const unlinkAsync = promisify(fs.unlink);
const accessAsync = promisify(fs.access);
const mkdirAsync = promisify(fs.mkdir);

const fsHelper = {

    //! Function to delete a file
    async deleteFileIfExists(filePath) {
        try {
            await accessAsync(filePath, fs.constants.F_OK);     // Check if file exists
            await unlinkAsync(filePath);        // Delete file
            // console.log(`Deleted file: ${filePath}`);
        } catch (err) {
            if (err.code !== 'ENOENT') {   
                // console.error(`Could not delete: ${filePath}`, err);
                throw err;
            }
        }
    },

    

    //! Function to Check if a folder exists
    async isFolderExists(folderPath) {
        try {
            await accessAsync(folderPath);      // Check if folder exists
            // console.log(`Folder already exists: ${folderPath}`);
        } catch {
            await mkdirAsync(folderPath, { recursive: true });      // Create folder
            // console.log(`Folder created: ${folderPath}`);
        }
    }
};

module.exports = fsHelper;
