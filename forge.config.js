/* tslint:disable */

module.exports = {
  packagerConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      platforms: ["win32"],
      config: {
        name: "electron_fiddle"
      }
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"]
    },
    {
      name: "@electron-forge/maker-deb",
      platforms: ["linux"]
    },
    {
      name: "@electron-forge/maker-rpm",
      platforms: ["linux"]
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'electron',
          name: 'fiddle'
        },
        prerelease: true
      }
    }
  ]
};
