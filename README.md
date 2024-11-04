# File Tree Generation

A Visual Studio Code extension that generates a visual tree structure of your folders and files. Perfect for documentation, sharing project structures, or getting a quick overview of your project's organization.

## Features

- Generate file tree structure with a right-click on any folder
- Customize the depth of tree generation
- Default ignore patterns for common folders (`node_modules`, `.git`, hidden files)
- Output in a clear, markdown-formatted document
- View tree structure with proper indentation and branch visualization

## Usage

1. Right-click on any folder in VS Code's explorer
2. Select "Generate File Tree" from the context menu
3. Enter your desired depth level (or leave empty for unlimited depth)
4. The extension will automatically ignore:
   - `node_modules` directory
   - `.git` directory
   - Hidden files (starting with `.`)
5. A new document will open showing your file tree structure

Example output:
```
# File Tree for: my-project
Generated on: November 4, 2024
Path: my-project

├── src/
│   ├── components/
│   │   ├── Button.ts
│   │   └── Input.ts
│   └── index.ts
├── tests/
│   └── test.ts
└── package.json
```

## Requirements

No additional requirements. Just install and use!

## Extension Settings

This extension works out of the box with sensible defaults:
- Automatically ignores `node_modules` and `.git` directories
- Skips hidden files and directories (starting with `.`)
- Unlimited depth by default (can be customized per use)

## Known Issues

- Large directories with many files might take longer to process
- Some special characters in file names might not display correctly

## Release Notes

### 0.0.2

- Updated documentation to clarify ignored files feature
- Better explanation of default behavior

### 0.0.1

Initial release of File Tree Generation:
- Basic file tree generation
- Depth control
- Automatic file/folder ignoring
  - node_modules
  - .git
  - Hidden files
- Markdown output format

## Contributing

Feel free to open issues or submit pull requests on the repository.

## License

MIT

---

**Enjoy!**