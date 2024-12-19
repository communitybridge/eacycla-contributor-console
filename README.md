# EasyCLA Contributor Console

A stand-alone EasyCLA console for contributors to support the LFX platform.

The contributor console is accessed by a GitHub (or Gerrit) link when a pull request fails to pass the CLA
authorization.
![GitHub Page](github-page.png)

When the user selects the authorization link on GitHub or Gerrit they are directed to the contributor console landing
page.  The user can select either the Individual Contributor or Corporate Contributor options.
![Landing Page](landing-page.png)

If the user selected the Individual Contributor option, a new DocuSign signing request is generated.  For Corporate
Contributors users will need to first select their company from a list.  Both processes are similar.  Additional
workflows are available if the user's company is not configured in the EasyCLA system.
![Create Signing Request](create-docusign.png)

DocuSign CLA document header section.
![Docusign View 1](docusign-1.png)

DocuSign CLA document signing section.
![Docusign View 2](docusign-2.png)

Once the CLA is signed, the GitHub pull request status is updated.
![GitHub Success Page](github-success-page.png)

## Documentation

Please see our [online product documentation](https://docs.linuxfoundation.org/lfx/easycla) for a complete product
overview.

## License

Copyright The Linux Foundation and each contributor to the LFX platform.

This project’s source code is licensed under the MIT License. A copy of the license is available in LICENSE.

This project’s documentation is licensed under the Creative Commons Attribution 4.0 International License \(CC-BY-4.0\). A copy of the license is available in LICENSE-docs.

