import childProc = require('child_process');
import * as path from 'path';
import * as vscode from 'vscode';
import jiraFactory from '../JiraFactory';
import { BranchTypes, ExtensionConfig, IssueItem, IssueTypes, JiraResponse } from '../models/interfaces';
import { JiraIssue } from '../models/JiraIssue';
import { IssueDetailPanel } from '../views';

let jiraClient: { loadError: any; searchWithQueryFromConfig?: any };
let config: vscode.WorkspaceConfiguration;
let declarations: { bugs; issues };

try {
    config = vscode.workspace.getConfiguration('jira');
    declarations = config.get('issueTypes') as { bugs; issues };
    jiraClient = jiraFactory.instantiateJira(config);
} catch (error) {
    jiraClient = {
        loadError: error.message,
    };
}

export class JiraProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    public _onDidChangeTreeData = new vscode.EventEmitter<vscode.TreeItem | undefined>();
    public readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private fetching: boolean = false;
    private lastFetch: number;
    private totalCount: number;

    constructor(private context: vscode.ExtensionContext) {
        const appName = 'JirAux';
        const appCommands = [
            {
                Name: `${appName}.createBranch`,
                Reference: this.createBranch,
            },
            {
                Name: `${appName}.openIssue`,
                Reference: this.openIssue,
            },
            {
                Name: `${appName}.refresh`,
                Reference: this.refresh,
            },
            {
                Name: `${appName}.showDescription`,
                Reference: this.showDescription,
            },
        ];

        appCommands.map(command => {
            context.subscriptions.push(
                vscode.commands.registerCommand(command.Name, command.Reference, this),
            );
        });

        // Check changes from JIRA
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(this.poll, this));

        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(() => {
                const newconfig = vscode.workspace.getConfiguration('jira');
                this.refresh(newconfig);
            }),
        );
    }

    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    public async getChildren(): Promise<vscode.TreeItem[]> {
        return this.getJiraIssues();
    }

    private getCount(issueList: IssueItem[], taskType: IssueTypes): number {
        return issueList.filter(({ fields: { issuetype: { name } } }) => name.includes(taskType))
            .length;
    }

    private getIcons(jiraIssue: JiraIssue): void {
        const issueTypes: IssueTypes = jiraIssue.item.fields.issuetype.name;
        const icon = `${this.getIssueType(issueTypes).toLowerCase()}.svg`;
        jiraIssue.iconPath = {
            dark: this.context.asAbsolutePath(path.join('assets', 'icons', 'dark', icon)),
            light: this.context.asAbsolutePath(path.join('assets', 'icons', 'light', icon)),
        };
    }

    private async getJiraIssues(): Promise<vscode.TreeItem[]> {
        if (jiraClient.loadError) {
            return [new vscode.TreeItem(jiraClient.loadError)];
        }
        try {
            const data: JiraResponse = await jiraClient.searchWithQueryFromConfig();
            this.totalCount = data.issues.length;

            let children: JiraIssue[] = [];
            const promises = data.issues.map(async (issue: IssueItem) => {
                const jiraIssue = new JiraIssue(`${issue.key}: ${issue.fields.summary}`, issue);
                this.getIcons(jiraIssue);
                jiraIssue.contextValue = 'issue';
                children = [...children, jiraIssue];
            });
            await Promise.all(promises);
            if (!children.length) {
                return [new vscode.TreeItem('No issues')];
            }
            return children;
        } catch (e) {
            if (e.message.includes('Unauthorized')) {
                return [new vscode.TreeItem('Username or password is incorrect')];
            }
            vscode.window.showErrorMessage(`Error retrieving issues: ${JSON.stringify(e)}`);
            return [new vscode.TreeItem(`Error retrieving issues`)];
        }
    }

    private async refresh(configuration?: ExtensionConfig): Promise<void> {
        if (!this.fetching) {
            if (configuration) {
                try {
                    jiraClient = jiraFactory.instantiateJira(configuration);
                } catch (error) {
                    jiraClient = {
                        loadError: error.message,
                    };
                    vscode.window.showErrorMessage(error);
                }
            }
            await this.getChildren();
            this._onDidChangeTreeData.fire();
        }
    }

    private async poll(): Promise<void> {
        if (!this.lastFetch || this.lastFetch + config.poll < Date.now()) {
            return this.refresh();
        }
    }

    private openIssue(issue: JiraIssue): void {
        const base = issue.item.self.split('/rest')[0];
        try {
            vscode.commands.executeCommand(
                'vscode.open',
                vscode.Uri.parse(`${base}/browse/${issue.item.key}`),
            );
        } catch (error) {
            console.error(error);
        }
    }

    private showDescription({ item }: JiraIssue): void {
        IssueDetailPanel.createOrShow(this.context.extensionPath, item);
    }

    private getIssueType(issueType: IssueTypes): IssueTypes {
        if (declarations.bugs.includes(issueType)) {
            return IssueTypes.Bug;
        } else if (declarations.issues.includes(issueType)) {
            return IssueTypes.Task;
        } else if (issueType === IssueTypes.Story) {
            return IssueTypes.Story;
        } else {
            return IssueTypes.Task;
        }
    }

    private async createBranch({
        item: {
            key,
            fields: {
                issuetype: { name },
            },
        },
    }: JiraIssue): Promise<void> {
        const branchName = `${this.getBranchPrefix(this.getIssueType(name))}/${key}`;
        const editor = vscode.window.activeTextEditor;
        let focusedDir;
        try {
            focusedDir = path.dirname(editor!.document.uri.path);
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }

        const switchAndCreate: any = await childProc.exec(
            `cd ${focusedDir} && git fetch && git checkout -b ${branchName}`,
        );
        try {
            switchAndCreate.stderr.on('data', async message => {
                if (message.includes('already')) {
                    try {
                        await this.switchBranch(branchName);
                        return await vscode.window.showInformationMessage(
                            `Switched to branch ${branchName}`,
                        );
                    } catch (error) {
                        vscode.window.showErrorMessage(error);
                    }
                } else if (message.includes('switched')) {
                    return vscode.window.showInformationMessage(message);
                } else {
                    vscode.window.showInformationMessage(message);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(error);
        }
    }

    private getBranchPrefix(type: IssueTypes): BranchTypes {
        switch (type) {
            case IssueTypes.Bug:
                return BranchTypes.BugFix;
            case IssueTypes.Task:
                return BranchTypes.Feature;
            case IssueTypes.Story:
                return BranchTypes.Feature;
            default:
                return BranchTypes.Default;
        }
    }

    private async switchBranch(branchName: string): Promise<void> {
        try {
            await childProc.exec(`cd ${vscode.workspace.rootPath} && git checkout ${branchName}`);
        } catch (error) {
            console.error(error);
        }
    }
}
