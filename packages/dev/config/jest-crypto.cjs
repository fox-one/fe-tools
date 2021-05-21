const crypto = require("crypto");

Object.defineProperties(global.self, "crypto", {
  value: {
    getRandomValues: (arr) => {
      crypto.randomBytes(arr.lenght).reduce((arr, value, index) => {
        arr[index] = value;

        return arr;
      }, arr);
    }
  }
});
