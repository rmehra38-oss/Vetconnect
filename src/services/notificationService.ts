
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const sendNotification = (title: string, body: string, options?: NotificationOptions) => {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      ...options
    });
  }
};

export const scheduleReminder = (title: string, body: string, delayInMs: number) => {
  setTimeout(() => {
    sendNotification(title, body);
  }, delayInMs);
};
