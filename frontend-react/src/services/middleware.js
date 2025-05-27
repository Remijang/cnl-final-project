const checkTimestamp = (timestamp) => {
  return new Date(timestamp).getTime() > 0;
};
