import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface GeneratorOptions {
    maxDepth: number;
    ignorePatterns: string[];
}

export function activate(context: vscode.ExtensionContext) {
    console.log('File Tree Generation is now active');

    let disposable = vscode.commands.registerCommand('file-tree-generation.generateTree', async (uri: vscode.Uri) => {
        // If no URI was passed (command palette usage), ask for folder
        if (!uri) {
            const folders = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                title: 'Select Folder to Generate Tree'
            });
            
            if (folders && folders.length > 0) {
                uri = folders[0];
            } else {
                return;
            }
        }

        // Ask for depth
        const depthInput = await vscode.window.showInputBox({
            prompt: 'Enter maximum depth (leave empty for unlimited)',
            placeHolder: 'e.g., 2 for two levels deep',
            validateInput: (value) => {
                if (value === '') return null; // Allow empty for unlimited
                const num = parseInt(value);
                if (isNaN(num) || num < 1) {
                    return 'Please enter a positive number or leave empty for unlimited depth';
                }
                return null;
            }
        });

        if (depthInput === undefined) {
            return; // User cancelled
        }

        // Ask for ignore patterns
        const ignoreInput = await vscode.window.showInputBox({
            prompt: 'Enter patterns to ignore (comma-separated)',
            placeHolder: 'e.g., node_modules,.git,*.log,dist',
            value: 'node_modules,.git', // Default patterns
            validateInput: (value) => {
                if (value.includes('*') && !value.includes(',') && !value.includes('*.')) {
                    return 'Use *.extension for file patterns (e.g., *.log)';
                }
                return null;
            }
        });

        if (ignoreInput === undefined) {
            return; // User cancelled
        }

        const options: GeneratorOptions = {
            maxDepth: depthInput === '' ? Infinity : parseInt(depthInput),
            ignorePatterns: ignoreInput.split(',').map(p => p.trim()).filter(p => p)
        };

        try {
            if (fs.statSync(uri.fsPath).isDirectory()) {
                const fileTree = generateTree(uri.fsPath, '', 0, options);
                await createTreeDocument(fileTree, path.basename(uri.fsPath), options);
                vscode.window.showInformationMessage('File tree generated successfully!');
            }
        } catch (error) {
            vscode.window.showErrorMessage('Error generating file tree: ' + error);
        }
    });

    context.subscriptions.push(disposable);
}

function shouldIgnore(file: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
        if (pattern.startsWith('*.')) {
            // Handle file extension patterns
            const extension = pattern.slice(1); // Remove *
            return file.endsWith(extension);
        }
        return file === pattern || file.startsWith(pattern + '/');
    });
}

function generateTree(dirPath: string, prefix: string = '', currentDepth: number = 0, options: GeneratorOptions): string {
    if (currentDepth >= options.maxDepth) {
        return prefix + '...\n';
    }

    let result = '';
    const files = fs.readdirSync(dirPath);

    // Sort files and directories (directories first)
    const sortedFiles = files.sort((a, b) => {
        const aPath = path.join(dirPath, a);
        const bPath = path.join(dirPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();
        
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        return a.localeCompare(b);
    });

    // Filter out ignored files
    const filteredFiles = sortedFiles.filter(file => !shouldIgnore(file, options.ignorePatterns));

    filteredFiles.forEach((file, index) => {
        const fullPath = path.join(dirPath, file);
        const isLast = index === filteredFiles.length - 1;
        const stats = fs.statSync(fullPath);

        // Create the line prefix
        const linePrefix = prefix + (isLast ? '└── ' : '├── ');
        
        // Add the current file/directory to the tree
        const isDir = stats.isDirectory();
        result += `${linePrefix}${file}${isDir ? '/' : ''}\n`;

        // If it's a directory and we haven't reached max depth, recurse into it
        if (isDir) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            result += generateTree(fullPath, newPrefix, currentDepth + 1, options);
        }
    });

    return result;
}

async function createTreeDocument(content: string, folderName: string, options: GeneratorOptions) {
    // Add header with timestamp and metadata
    const header = `# File Tree for: ${folderName}\n` +
                  `Generated on: ${new Date().toLocaleString()}\n` +
                  `Path: ${folderName}\n` +
                  `Max Depth: ${options.maxDepth === Infinity ? 'Unlimited' : options.maxDepth}\n` +
                  `Ignored Patterns: ${options.ignorePatterns.join(', ') || 'None'}\n\n` +
                  '```\n' +
                  content +
                  '```\n';
    
    // Create and show the document
    const document = await vscode.workspace.openTextDocument({
        content: header,
        language: 'markdown'
    });
    await vscode.window.showTextDocument(document, {
        preview: false,
        viewColumn: vscode.ViewColumn.Beside
    });
}

export function deactivate() {}