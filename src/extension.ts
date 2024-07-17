import * as vscode from 'vscode';
import { FileSizeTreeDataProvider } from './fileSizeTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
    const rootPath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders[0].uri.fsPath
        : undefined;

    const outputChannel = vscode.window.createOutputChannel('ByteBuddy');
    const fileSizeTreeDataProvider = new FileSizeTreeDataProvider(rootPath, context);

    vscode.window.registerTreeDataProvider('fileSizeExplorer', fileSizeTreeDataProvider);

    context.subscriptions.push(
        vscode.commands.registerCommand('fileSizeExplorer.refresh', () => {
            fileSizeTreeDataProvider.refresh();
        }),

        vscode.commands.registerCommand('fileSizeExplorer.sort', async () => {
            const sortOption = await vscode.window.showQuickPick(['Name', 'Size', 'Type'], {
                placeHolder: 'Select sorting option'
            });

            if (sortOption) {
                fileSizeTreeDataProvider.setSortOrder(sortOption.toLowerCase() as 'name' | 'size' | 'type');
            }
        })
    );

    vscode.window.showInformationMessage('ByteBuddy is now active!');
}

export function deactivate() {
    vscode.window.showInformationMessage('ByteBuddy has been deactivated.');
}