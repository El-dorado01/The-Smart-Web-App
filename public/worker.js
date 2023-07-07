self.addEventListener('push', e => {
    //Get the payload from the event
    const data = e.data.json();

    var options = {
        body: data.body,
        icon: "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTl_4u0xR-Y5GfstgqXPImiNBDE6CtW9CGe5Lh8ENqYle7EE33S",
        badge: "https://w7.pngwing.com/pngs/626/804/png-transparent-globe-computer-icons-globe-miscellaneous-computer-wallpaper-world-thumbnail.png",
        // image: "",
        actions: [
            {
                action: 'open-link',
                type: 'button',
                title: 'Open Link',
                icon: '/images/demos/action-1-128x128.png',
            },
        ],
        tag: data.otherInfo.forumID,
        // timestamp: Date.now(),
        data: data.otherInfo,
    }
    self.registration.showNotification(data.title, options);
});

self.addEventListener('notificationclick', (event) => {
    console.log(event);
//   const clickedNotification = event.notification;
//   clickedNotification.close();

//   // Do something as the result of the notification click
//   const promiseChain = doSomething();
//   event.waitUntil(promiseChain);
});