export const log = (
  level: "info" | "error" | "warn",
  requestId: string,
  message: string,
  data?: object,
) => {
  const logObject = {
    level,
    timestamp: new Date().toISOString(),
    requestId,
    message,
    ...data,
  };
  console.log(JSON.stringify(logObject));
};
