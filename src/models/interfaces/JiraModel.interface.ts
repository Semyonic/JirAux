export interface JiraResponse {
    expand: string;
    issues: IssueItem[];
    maxResults: number;
    startAt: number;
    total: number;
}

export interface FieldProp {
    self: string;
    id: string;
    name: string | any;
    iconUrl: string;
}

export interface Status extends Partial<FieldProp> {
    name: IssueTypes;
    description: string;
}

export interface Progress {
    progress: number;
    total: number;
    percent: number;
    issuetype: IssueType;
    project: Project;
}

export interface IssueType extends Partial<FieldProp> {
    description: string;
    name: IssueTypes;
    subtask: boolean;
    avatarid: string;
}

export interface Project extends Partial<FieldProp> {
    key: string;
}

export type Priority = Partial<FieldProp>;

export interface Fields {
    fixVersions: string[];
    resolution: string;
    priority: Priority;
    status: Status;
    progress: Progress;
    issuetype: IssueType;
    description: string;
    summary: string;
    duedate: string;
}

export interface IssueItem extends FieldProp {
    key: string;
    expand: string;
    fields: Fields;
}

export const enum IssueTypes {
    Task = 'Task',
    SubTask = 'Sub-Task',
    Bug = 'Bug',
    SubBug = 'Sub-Bug',
    Story = 'Story',
}

export const enum BranchTypes {
    Default = '',
    BugFix = 'fix',
    Feature = 'feature',
    HotFix = 'hotfix'
}