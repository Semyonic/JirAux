import * as path from 'path';
import * as vscode from 'vscode';
import { IssueItem } from '../models/interfaces';

export class IssueDetailPanel {
    public static currentPanel: IssueDetailPanel | undefined;
    public static readonly viewType = 'JirAux';
    private readonly panel: vscode.WebviewPanel;
    private readonly extensionPath: string;
    private disposables: vscode.Disposable[] = [];
    public static msgData: IssueItem;

    public static createOrShow(extensionPath: string, data: any = null): void {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            IssueDetailPanel.viewType,
            'Issue View',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))],
            },
        );
        this.msgData = data;
        IssueDetailPanel.currentPanel = new IssueDetailPanel(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string): void {
        IssueDetailPanel.currentPanel = new IssueDetailPanel(panel, extensionPath);
    }

    constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this.panel = panel;
        this.extensionPath = extensionPath;

        this.update();

        this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.panel.onDidChangeViewState(
            _ => {
                if (this.panel.visible) {
                    this.update();
                }
            },
            null,
            this.disposables,
        );

        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(
            message => {
                vscode.window.showErrorMessage(message.text);
            },
            null,
            this.disposables,
        );
    }

    public sendMessageToView(data: any): void {
        // Send a message to the webview to webview.
        this.panel.webview.postMessage(data);
        this.update();
    }

    public dispose(): void {
        IssueDetailPanel.currentPanel = undefined;

        // Clean up our resources
        this.panel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private update(): void {
        switch (this.panel.viewColumn) {
            case vscode.ViewColumn.Two:
                new IssueDetailPanel(this.panel, this.extensionPath);
                this.updateContent(IssueDetailPanel.msgData.key);
                return;

            case vscode.ViewColumn.Three:
                new IssueDetailPanel(this.panel, this.extensionPath);
                this.updateContent(IssueDetailPanel.msgData.key);
                return;

            case vscode.ViewColumn.One:
            default:
                this.updateContent(IssueDetailPanel.msgData.key);
                return;
        }
    }

    private updateContent(issueKey: string): void {
        this.panel.title = issueKey;
        this.panel.webview.html = this.getHTMLView();
    }

    private stripHTMLTags(content: string): string {
        return content.replace(/<(.|\n)*?>/g, '');
    }

    private getHTMLView(): string {
        const {
            description,
            issuetype,
            status,
            duedate,
            summary,
            progress: { total, percent },
            priority,
        } = IssueDetailPanel.msgData.fields;
        return `<!DOCTYPE html>
            <head>
                <meta charset="utf-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="description" content="">
                <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body>
            <header>
            <span id="status" class="badge badge-primary">Priority: ${priority.name}</span>
            <br>
            <span id="status" class="badge badge-primary">Status: ${status.name}</span>
            <br>
            <span id="status" class="badge badge-primary">Due Date: ${new Date(duedate)}</span>
            <br>
            <!-- <div class="progress">
                <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="${total}" style="width: ${percent}%"></div>
            </div> -->
            </header>
                <div class="container">
                ${description}
                </div>
            </body>
        </html>`;
    }
}
