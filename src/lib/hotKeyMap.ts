export function mapIndexToKey(index: number) {
  if (index < 0) {
    return null;
  } else if (index < 9) {
    return index + 1;
  } else if (index < 13) {
    return index + 3;
  } else if (index < 14) {
    return index + 8;
  } else if (index < 17) {
    return index + 9;
  } else if (index < 19) {
    return index + 14;
  } else if (index < 22) {
    return index + 15;
  } else if (index < 25) {
    return index + 19;
  } else if (index < 27) {
    return index + 20;
  } else if (index < 30) {
    return index + 25;
  } else if (index < 32) {
    return index + 26;
  } else return null;
};

export function mapKeyToIndex(key: number) {
  if (key === null || key <= 0) {
    return -1;
  } else if (key <= 9) {  // idx 0-8
    return key - 1;
  } else if (key >= 12 && key <= 15) {  // idx 9-12
    return key - 3;
  } else if (key  == 21) {  // idx 13
    return key - 8;
  } else if (key >= 23 && key <= 25) {  // idx 14-16
    return key - 9;
  } else if (key >= 31 && key <= 32) {  // idx 17-18
    return key - 14;
  } else if (key >= 34 && key <= 36) { //idx 19-21
    return key - 15;
  } else if (key >= 41 && key <= 43) {  // idx 22-24
    return key - 19;
  } else if (key >= 45 && key <= 46) { // idx 25-26
    return key - 20;
  } else if (key >= 52 && key <= 54) {  // idx 27-29
    return key - 25;
  } else if (key >= 56 && key <= 57) { // idx 30-31
    return key - 26;
  } else {
    return null;
  };
};