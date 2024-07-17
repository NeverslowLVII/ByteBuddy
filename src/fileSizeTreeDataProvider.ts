import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class FileSizeTreeDataProvider implements vscode.TreeDataProvider<FileSizeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileSizeItem | undefined | null | void> = new vscode.EventEmitter<FileSizeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileSizeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private sortOrder: 'name' | 'size' | 'type' = 'name';

    constructor(private workspaceRoot: string | undefined, private context: vscode.ExtensionContext) {}

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

        if (element) {
            return Promise.resolve([]);
        }

        const allFiles = await this.getAllFiles(this.workspaceRoot);
        return this.sortItems(allFiles);
    }

    private async getAllFiles(dir: string): Promise<FileSizeItem[]> {
        const items: FileSizeItem[] = [];
        const files = await fs.promises.readdir(dir);

        for (const file of files) {
            const filePath = path.join(dir, file);
            const stats = await fs.promises.stat(filePath);
            const relativePath = path.relative(this.workspaceRoot!, filePath);
            const sizeString = this.formatSize(stats.size);

            if (stats.isDirectory()) {
                items.push(...await this.getAllFiles(filePath));
            } else {
                items.push(new FileSizeItem(
                    relativePath,
                    vscode.TreeItemCollapsibleState.None,
                    vscode.Uri.file(filePath),
                    sizeString,
                    stats.size,
                    this.context
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
                    const extA = path.extname(a.label);
                    const extB = path.extname(b.label);
                    return extA.localeCompare(extB) || a.label.localeCompare(b.label);
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
        public readonly sizeInBytes: number,
        private context: vscode.ExtensionContext
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label} (${this.size})`;
        this.description = this.size;
        this.setIcon();
        this.contextValue = 'file';
    }

    private setIcon() {
        this.iconPath = {
            light: this.context.asAbsolutePath(path.join('resources', 'light', 'file.svg')),
            dark: this.context.asAbsolutePath(path.join('resources', 'dark', 'file.svg'))
        };
    }
}