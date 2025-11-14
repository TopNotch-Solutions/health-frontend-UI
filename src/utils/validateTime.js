export const validateTimeRangeOrClosed = (str) => {
    if (!str) return false;
  
    const rangeTimeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)\s?-\s?(1[0-2]|0?[1-9]):[0-5][0-9]\s?(AM|PM)$/i;
  
    if (str === "Closed" || rangeTimeRegex.test(str)) {
      return true;
    }
    return false;
  };