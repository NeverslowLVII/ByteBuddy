import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileSizeTreeDataProvider implements vscode.TreeDataProvider<FileSizeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileSizeItem | undefined | null | void> = new vscode.EventEmitter<FileSizeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileSizeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private sortOrder: 'name' | 'size' | 'type' = 'name';

    constructor(private workspaceRoot: string | undefined) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileSizeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FileSizeItem): Promise<FileSizeItem[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No folder opened');
            return Promise.resolve([]);
        }

        const folderPath = element ? element.resourceUri.fsPath : this.workspaceRoot;
        const children = await this.getFilesInFolder(folderPath);
        return this.sortItems(children);
    }

    private async getFilesInFolder(folderPath: string): Promise<FileSizeItem[]> {
        const items: FileSizeItem[] = [];
        const files = await fs.promises.readdir(folderPath);

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const stats = await fs.promises.stat(filePath);
            const sizeString = this.formatSize(stats.size);

            if (stats.isDirectory()) {
                items.push(new FileSizeItem(
                    file,
                    vscode.TreeItemCollapsibleState.Collapsed,
                    vscode.Uri.file(filePath),
                    sizeString,
                    stats.size
                ));
            } else {
                items.push(new FileSizeItem(
                    file,
                    vscode.TreeItemCollapsibleState.None,
                    vscode.Uri.file(filePath),
                    sizeString,
                    stats.size
                ));
            }
        }

        return items;
    }

    private sortItems(items: FileSizeItem[]): FileSizeItem[] {
        switch (this.sortOrder) {
            case 'name':
                return items.sort((a, b) => a.label.localeCompare(b.label));
            case 'size':
                return items.sort((a, b) => b.sizeInBytes - a.sizeInBytes);
            case 'type':
                return items.sort((a, b) => {
                    if (a.collapsibleState === b.collapsibleState) {
                        return a.label.localeCompare(b.label);
                    }
                    return a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed ? -1 : 1;
                });
            default:
                return items;
        }
    }

    setSortOrder(order: 'name' | 'size' | 'type'): void {
        this.sortOrder = order;
        this.refresh();
    }

    private formatSize(sizeInBytes: number): string {
        if (sizeInBytes < 1024) {
            return `${sizeInBytes} B`;
        } else if (sizeInBytes < 1024 * 1024) {
            return `${(sizeInBytes / 1024).toFixed(1)} KB`;
        } else {
            return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
        }
    }
}

export class FileSizeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri: vscode.Uri,
        public readonly size: string,
        public readonly sizeInBytes: number
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.size})`;
        this.description = this.size;
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'file.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'file.svg')
    };

    contextValue = 'file';
}