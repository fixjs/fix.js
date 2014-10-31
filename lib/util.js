function slice(array, start, end) {
    if (typeof start === 'undefined') {
      start = 0;
    }
    if (typeof end === 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
      length = end - start || 0,
      result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }