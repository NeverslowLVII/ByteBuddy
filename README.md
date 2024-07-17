# ByteBuddy

ByteBuddy is a Visual Studio Code extension that displays file and folder sizes directly in the explorer view, making it easy to keep track of your project's storage usage.

## Features

- Display file and folder sizes in a custom explorer view
- Copy file/folder sizes to clipboard
- Refresh file sizes on demand
- Support for various size units (B, KB, MB, GB)

<!-- ![ByteBuddy in action](images/bytebuddy-demo.gif) -->

## Installation

1. Open Visual Studio Code
2. Press `Ctrl+P` to open the Quick Open dialog
3. Type `ext install NeverslowLVII.bytebuddy` to find the extension
4. Click the `Install` button, then the `Enable` button

## Usage

After installation, you'll see a new "File Sizes" view in the explorer. This view shows all files and folders with their sizes.

- To copy a file or folder size, right-click on the item and select "Copy Size"
- To copy a file or folder path, right-click on the item and select "Copy Path"
- To refresh the file sizes, click the refresh button at the top of the "File Sizes" view

## Extension Settings

This extension contributes the following settings:

* `bytebuddy.showHiddenFiles`: Enable/disable showing hidden files and folders
* `bytebuddy.sizeDisplayUnit`: Set the default unit for displaying file sizes (B, KB, MB, GB)

## Known Issues

Currently, there are no known issues. If you encounter any problems, please file an issue on our [GitHub repository](https://github.com/NeverslowLVII/ByteBuddy).

## Release Notes

### 0.0.1

Initial release of ByteBuddy
- Display file and folder sizes in a custom explorer view
- Copy file/folder sizes to clipboard
- Refresh file sizes on demand

## Contributing

Contributions are always welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Enjoy using ByteBuddy!**