# Release Steps

- Update version in `package.json` file.
    Example: `"version": "1.1.2",`
- Run `npm install` to create `package-lock.json`.
- Complete and merge PR successfully.
- Create release with the same version mentioned in `package.json`. i.e., `"version": "1.1.2",` and create a release with same version`v1.1.2`.