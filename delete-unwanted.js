const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Ensure both source and target directories are provided
if (process.argv.length !== 4) {
    console.error('Usage: node cleanup.js <source_directory> <target_directory>');
    process.exit(1);
}

const sourceDir = process.argv[2];
const targetDir = process.argv[3];

// Check if source and target directories exist
async function checkDirectories() {
    try {
        await fs.access(sourceDir);
        await fs.access(targetDir);
    } catch (error) {
        console.error(`Error accessing directory: ${error.message}`);
        process.exit(1);
    }
}

// Generate a list of files and directories not ignored by Git
function getGitTrackedFiles(dir) {
    const cmd = `cd ${dir} && git ls-files `;
    const result = execSync(cmd, { encoding: 'utf8' });
    return result.split('\n').filter(Boolean);
}

const gitTrackedFiles = getGitTrackedFiles(sourceDir);
console.log('Git tracked files:', gitTrackedFiles);
// Helper function to get all files and directories from a given directory
async function getAllPaths(dir, base = dir) {
    let results = [];
    const list = await fs.readdir(dir);
    const promises = list.map(async (file) => {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            results = results.concat(await getAllPaths(filePath, base));
        }
        results.push(path.relative(base, filePath));
    });
    await Promise.all(promises);
    return results;
}

// Delete items in source that do not exist in the target directory
async function deleteItems() {
    try {
        const sourcePaths = await getAllPaths(sourceDir);
        const deletionPromises = gitTrackedFiles.map(async (srcPath) => {
            const targetPath = path.join(targetDir, srcPath);
            const fullPath = path.join(sourceDir, srcPath);
            
            try {
                await fs.access(targetPath)
            } catch (err) {
                console.log(`Deleting ${fullPath}`);
                const stat = await fs.stat(fullPath);
                if (stat.isDirectory()) {
                    await fs.rmdir(fullPath, { recursive: true });
                } else {
                    await fs.unlink(fullPath);
                }
            }
            // if (!gitTrackedFiles.includes(srcPath) || !(await fs.access(targetPath).then(() => true).catch(() => false))) {
            //     console.log(`Deleting ${fullPath}`);
            //     const stat = await fs.stat(fullPath);
            //     if (stat.isDirectory()) {
            //         await fs.rmdir(fullPath, { recursive: true });
            //     } else {
            //         await fs.unlink(fullPath);
            //     }
            // }
        });

        await Promise.all(deletionPromises);
        console.log('Cleanup completed.');
    } catch (error) {
        console.error(`Error during cleanup: ${error.message}`);
    }
}

async function main() {
    await checkDirectories();
    await deleteItems();
}

main();
