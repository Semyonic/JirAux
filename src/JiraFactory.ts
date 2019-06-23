const JiraApi = require('jira-client');
import { ExtensionConfig, JiraConfig } from './models/interfaces';

const JiraFactory = {
    instantiateJira,
    checkJiraConfig,
};

function instantiateJira(config: ExtensionConfig) {
    if (!config.baseUrl) {
        throw new Error('Configuration missing - check your global vscode settings');
    }
    const urlParts = config.baseUrl.split('://');
    const protocol = urlParts[0];
    const host = urlParts[1];
    if (urlParts.length !== 2 || (protocol !== 'http' && protocol !== 'https')) {
        throw new Error('Invalid URL');
    }
    const jiraConfig: Partial<JiraConfig> = {
        protocol,
        host,
        port: config.port,
        username: config.username,
        password: config.password,
        apiVersion: '2',
        strictSSL: false,
    };

    let jira;
    try {
        jira = new JiraApi(jiraConfig);
    } catch (e) {
        console.log(e);
    }

    jira.loaded = true;

    jira.searchWithQueryFromConfig = async () => {
        const jqlExpression = config.get('jqlExpression');
        return await jira.searchJira(jqlExpression);
    };
    return jira;
}

function checkJiraConfig(newconfig: JiraConfig) {
    let valid = true;
    if (!newconfig) {
        return (valid = false);
    }
    if (!newconfig.username || !newconfig.password || !newconfig.host || !newconfig.protocol) {
        valid = false;
    }
    return valid;
}

export default JiraFactory;
