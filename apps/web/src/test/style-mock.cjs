module.exports = new Proxy(
  {},
  {
    get: (_target, key) => {
      return key;
    },
  },
);
