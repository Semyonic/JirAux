import * as vscode from 'vscode';
import { IssueItem } from './interfaces';

export class JiraIssue extends vscode.TreeItem {
    public iconPath: Partial<vscode.ThemeIcon> | undefined;
    constructor(label: string, public item: IssueItem) {
        super(label);
    }
}
