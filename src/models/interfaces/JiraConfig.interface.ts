export interface JiraConfig {
    protocol?: string;
    host: string;
    port?: string;
    username: string;
    password: string;
    poll?: number;
    issueTypes?: string[];
    apiVersion?: string;
    strictSSL?: boolean;
    jql?: string;
}
