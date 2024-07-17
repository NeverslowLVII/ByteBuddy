import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { FileSizeTreeDataProvider } from '../fileSizeTreeDataProvider';

suite('ByteBuddy Extension Test Suite', () => {
    let workspaceFolder: string;
    let treeDataProvider: FileSizeTreeDataProvider;
    let outputChannel: vscode.OutputChannel;

    suiteSetup(() => {
        workspaceFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-test-workspace-'));
        
        fs.writeFileSync(path.join(workspaceFolder, 'test1.txt'), 'Test file 1');
        const testContent = 'Test file 2 with more content';
        fs.writeFileSync(path.join(workspaceFolder, 'test2.txt'), testContent);
        fs.mkdirSync(path.join(workspaceFolder, 'testdir'));
        
        outputChannel = vscode.window.createOutputChannel('ByteBuddy Test');
        treeDataProvider = new FileSizeTreeDataProvider(workspaceFolder);
    });

    suiteTeardown(() => {
        fs.rmSync(workspaceFolder, { recursive: true, force: true });
        outputChannel.dispose();
    });

    test('FileSizeTreeDataProvider is instantiated', () => {
        assert.ok(treeDataProvider, 'FileSizeTreeDataProvider should be instantiated');
    });

    test('File size is correctly calculated', async () => {
        const children = await treeDataProvider.getChildren();
        const testFile = children.find(item => item.label === 'test2.txt');
        assert.ok(testFile, 'test2.txt should be found');
        assert.strictEqual(testFile.size, '29 B', 'File size should be 29 bytes');
    });

    test('Folders are included in tree view', async () => {
        const children = await treeDataProvider.getChildren();
        const testDir = children.find(item => item.label === 'testdir');
        assert.ok(testDir, 'testdir should be found');
        assert.strictEqual(testDir.collapsibleState, vscode.TreeItemCollapsibleState.Collapsed, 'Folder should be collapsible');
    });

    test('Large file sizes are displayed in KB', async () => {
        const largeContent = Buffer.alloc(1024 * 5); // 5KB of data
        const largeFilePath = path.join(workspaceFolder, 'large-file.bin');
        fs.writeFileSync(largeFilePath, largeContent);
        await treeDataProvider.refresh();
        const children = await treeDataProvider.getChildren();
        const largeFile = children.find(item => item.label === 'large-file.bin');
        assert.ok(largeFile, 'large-file.bin should be found');
        assert.strictEqual(largeFile.size, '5.0 KB', 'File size should be 5.0 KB');
    });

    test('Non-existent files are not included', async () => {
        const children = await treeDataProvider.getChildren();
        const nonExistentFile = children.find(item => item.label === 'non-existent-file.txt');
        assert.strictEqual(nonExistentFile, undefined, 'Non-existent files should not be included');
    });

    test('Refresh updates the tree view', async () => {
        const newFilePath = path.join(workspaceFolder, 'new-file.txt');
        fs.writeFileSync(newFilePath, 'New file content');
        await treeDataProvider.refresh();
        const children = await treeDataProvider.getChildren();
        const newFile = children.find(item => item.label === 'new-file.txt');
        assert.ok(newFile, 'Newly created file should appear after refresh');
    });

    test('Sorting by name works correctly', async () => {
        treeDataProvider.setSortOrder('name');
        const children = await treeDataProvider.getChildren();
        assert.ok(children.length > 1, 'There should be multiple items');
        assert.ok(children[0].label < children[1].label, 'Items should be sorted alphabetically');
    });

    test('Sorting by size works correctly', async () => {
        treeDataProvider.setSortOrder('size');
        const children = await treeDataProvider.getChildren();
        assert.ok(children.length > 1, 'There should be multiple items');
        assert.ok(children[0].sizeInBytes >= children[1].sizeInBytes, 'Items should be sorted by size descending');
    });
});