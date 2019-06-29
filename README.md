# JirAux

<p align="center">
  <a href="https://travis-ci.com/Semyonic/JirAux"><img src="https://travis-ci.com/Semyonic/JirAux.svg?branch=master"/></a> <a href="https://codeclimate.com/github/Semyonic/JirAux/maintainability"><img src="https://api.codeclimate.com/v1/badges/fc701dce835cad12bdc2/maintainability" /></a> <a href="https://codeclimate.com/github/Semyonic/JirAux/test_coverage"><img src="https://api.codeclimate.com/v1/badges/fc701dce835cad12bdc2/test_coverage" /></a> <a href="https://marketplace.visualstudio.com/items?itemName=SemihOnay.JirAux"><img src="https://vsmarketplacebadge.apphb.com/version-short/SemihOnay.JirAux.svg"/></a> <a href="https://marketplace.visualstudio.com/items?itemName=SemihOnay.JirAux"> <img src="https://vsmarketplacebadge.apphb.com/downloads-short/SemihOnay.JirAux.svg"/></a> <a href="https://marketplace.visualstudio.com/items?itemName=SemihOnay.JirAux"> <img src="https://vsmarketplacebadge.apphb.com/installs-short/SemihOnay.JirAux.svg"/></a> <a href="https://marketplace.visualstudio.com/items?itemName=SemihOnay.JirAux"><img src="https://vsmarketplacebadge.apphb.com/rating-star/SemihOnay.JirAux.svg" /></a>
</p>

Simple extension to create Git-flow like branches from selected issues and view selected issue
descriptions.

## Set up

Define the following settings in your **settings.json** :

- `jira.baseUrl`
- `jira.username`
- `jira.password`

Example:

```json
"jira.baseUrl": "https://jira.your-company.com",
"jira.username": "myMail@domain.com",
"jira.password": "secretPassword",
"jira.issueTypes": {
    "bugs": ["Bug","Sub-Bug","Defect", "Hata"],
    "issues": ["Task","Sub-Task","Sub-Gelistirme","Gelistirme"]
  },
```

## Contributing

File bugs and feature requests in [GitHub Issues](https://github.com/Semyonic/JirAux/issues).
Checkout the source code in the [GitHub Repository](https://github.com/Semyonic/JirAux).

## License

[MIT](./LICENSE)
