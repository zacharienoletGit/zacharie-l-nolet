module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/backend/'],
};
