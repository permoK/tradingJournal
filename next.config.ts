module.exports = {
  eslint: {
    ignoreDuringBuilds: true, // This only ignores linting errors during the build process
  },
  typescript: {
    ignoreBuildErrors: false, // Don't bypass type errors, fix them instead
  },
};
