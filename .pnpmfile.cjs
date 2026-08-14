// typedoc has no typescript 7 (tsgo) support: move its typescript peer
// to a regular dependency so it gets its own typescript 6, while the
// project itself builds with typescript 7.
function readPackage(pkg) {
  if (pkg.name === 'typedoc') {
    delete pkg.peerDependencies.typescript;
    pkg.dependencies = { ...pkg.dependencies, typescript: '^6.0.3' };
  }

  return pkg;
}

module.exports = { hooks: { readPackage } };
