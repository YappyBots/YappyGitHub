const EventResponse = require('../EventResponse');

class DependabotCreated extends EventResponse {
  constructor(...args) {
    super(...args, {
      description: 'This event is fired when a vulnerability alert is created',
    });
  }

  embed({ action, alert }) {
    const { dependency, security_vulnerability, security_advisory } = alert;
    const { name, ecosystem } = dependency.package;
    const { cve_id, ghsa_id, severity, summary } = security_advisory;

    return {
      color: '#8e44ad',
      title: `${this.formatAction(
        action
      )} a ${severity} dependabot alert for \`${name}\` (${ecosystem})`,
      url: alert.html_url,
      description:
        action === 'created'
          ? [
              `${summary} affecting \`${security_vulnerability.vulnerable_version_range}\`.`,
              '',
              `Classified as [${cve_id}](https://nvd.nist.gov/vuln/detail/${cve_id}), [${ghsa_id}](https://github.com/advisories/${ghsa_id})`,
            ].join('\n')
          : '',
    };
  }

  text({ action, alert }) {
    const { dependency, security_vulnerability, security_advisory } = alert;
    const { name, ecosystem } = dependency.package;
    const { severity, references } = security_advisory;

    return [
      `🛡 ${this.formatAction(
        action
      )} a ${severity} dependabot alert for \`${name}\` (${ecosystem}) affecting **${
        security_vulnerability.vulnerable_version_range
      }**. <${references.find((v) => v.url)?.url}>`,
    ];
  }

  formatAction(str) {
    return this.capitalize(str.replace('_', ' '));
  }
}

module.exports = DependabotCreated;
