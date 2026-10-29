module.exports = function (api) {
  api.cache(true);
  // zustand 미들웨어의 import.meta 를 웹 번들에서 변환
  return { presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]] };
};
