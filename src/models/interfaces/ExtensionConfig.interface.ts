import { WorkspaceConfiguration } from 'vscode';

export interface ExtensionConfig extends WorkspaceConfiguration {
    baseUrl?: string;
    port?: string;
    username?: string;
    password?: string;
    jqlExpression?: string;
    get(value: string): any;
}
