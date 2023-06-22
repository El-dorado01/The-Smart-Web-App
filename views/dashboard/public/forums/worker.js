self.addEventListener('push', e => {
    //Get the payload from the event
    const data = e.data.json();
    self.registration.showNotification(data.title, {
        body: "Here is the body of the notification"
    });
})