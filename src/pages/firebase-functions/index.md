---
title: Working with Firebase Functions
date: '2018-11-30'
---

Key takeaways:

- Functions are fairly straightforward for simple use cases
- Google has provided a lot of samples for using Functions
  - Maintaining a lot of samples is challenging
- There is a bit of confusion between when to use a Firebase API vs a Google Cloud API
- Overall, I think knowing how to use Functions is a key part of the tool-kit for an application developer that is looking to avoid building and maintaining a traditional back-end

# Where to Start

I started here: https://firebase.google.com/docs/functions/get-started .

I don't use the Realtime Database so I wasn't particularly interested in the sample provided but the Setup and Initialization steps (Steps 1 and 2) were useful. I chose Javascript simply because the first time I do anything I try to eliminate "Typescript frustration" (that's not actually a thing but I do find learning something new with Typescript adds to the learning curve). During the init you are also asked is you want to use eslint, I said yes (I am a big proponent of linting in general). Looking back I think I would have applied my Typescript logic to my eslint decision had I thought about it more. It did slow me down but not by a large amount. The default install creates functions for Node 6. Given that I run Node 10 locally I had some linting issues remembering old syntax.

There is also a quick video at the bottom of the page that is simple but good.

## Node version

Let's talk about the Node version for a minute. As I just mentioned, the default setup supports version 6. You can change this to 8. You just need to make a simple change to your package.json file, see - https://firebase.google.com/docs/functions/manage-functions##set_runtime_options . This opens the door to using async/await, destructuring and more (lots of stuff I've become fairly dependant on). There is some mention in the docs about 8 support being in beta (that's fine for me at this point).

## Running on Windows

If you are running on Windows (as I am) you will run into this issue (if it hasn't been addressed, and it doesn't look like a simple fix) - https://github.com/firebase/firebase-tools/issues/610 . The manual fix is simple - https://github.com/firebase/firebase-tools/issues/610#issuecomment-430629913 . This did slow me down a bit until I gave up trying to address it myself and turned to Google (search that is).

## My First Function

As I mentioned above, the sample from the docs walks you through using the Realtime Database so I wasn't interested. However, there is a very simple HelloWorld function that is included in the default install. You just need to comment it out. It looks like this:

```
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send('Hello from Firebase!');
});
```

After following the Deploy step (step 7) everything worked for me. I could see my function in the Firebase Console and it included the url to execute the function (a simple HTTPs request). If you have any doubt that your function is being executed you can see it on the Logs tab in the Firebase Console.

# My First Useful Function

As I mentioned above there are a lot of samples available. I am interested in generated thumbnails for uploaded images as described here - https://firebase.google.com/docs/storage/extend-with-functions . If you scroll to the bottom of the page you will find a link to a whole bunch of Function samples - https://github.com/firebase/functions-samples .

I started implementing the function as outlined on the Storage page above. I ran into a challenge with the @google-cloud/storage api version. It seems that the version used in the Storage example was probably 0.4.0, when I installed the latest I ended up with 2.3.1. As you can imagine the API had changed a bit and I spent a silly amount of time figuring out the current way to use the API. For anyone interested..

This:

```
const gcs = require('@google-cloud/storage')();
```

Becomes:

```
const { Storage } = require('@google-cloud/storage');
const gcs = new Storage();
```

With this change I got the sample working but burned quite a bit of time in the process. I also rewrote to leverage async/await (trivial).

## My First Useful Function Redux

When I first visited the samples page on Github (https://github.com/firebase/functions-samples) I didn't notice the Node-8 Branch. If you want to use Node 8 make sure you select the Node-8 Branch. This is where the sample maintenance challenge starts to pop up. The thumbnail generation sample (there is actually more than 1) works differently in the Node-8 Branch - it leverages the firebase-admin API for a number of things, including accessing storage (eliminating the need for the google-cloud/storage API). I would also describe the updated sample in the Node-8 Branch as a bit cleaner. So, I re-implemented following the updated sample. The only thing I left out was writing the results to the database. I have a separate process that handles that.

In fact, if you poke around the Function Samples for a bit you will notice there are actually two samples that generate thumbnails (they are slightly different but very similar):

- https://github.com/firebase/functions-samples/tree/Node-8/quickstarts/thumbnails
- https://github.com/firebase/functions-samples/tree/Node-8/generate-thumbnail

You can see my final function here: https://github.com/peterdyer7/generatethumbnail .

## console.log is your friend (as always)

Nothing, earth shattering here. I just wanted to note that anything you console.log will show up in the Firebase Console on the Logs tab - useful for troubleshooting.

# Future Considerations

One thing about the specific function I created is that I don't like that it gets "over-called". That is, each image uploaded results in the function being called twice. The first call is a result of the image being uploaded, the second call is a result of the thumbnail being created. I have the appropriate code in place ( check the filename to see if the file is a thumbnail) to make sure this double call doesn't result in undesirable behavior. The second call takes less than 10 ms which probably wouldn't bother anyone. To that end, I did push logic down in the function below the thumbnail check to keep things efficient.

In the future I might generate a number of different images sizes, not just a thumbnail, and I don't want this problem to get worse. From what I can tell the way to work around this would be to use different storage buckets. That is, the "source" image and thumbnail (and any subsequent generated images) should be placed in different buckets. This would require a different Firebase "plan", or maybe the use of a real Google Cloud account (which I do have), but for the purposes of my prototype application I'm not going to worry about addressing this.

# Final Thoughts

There are a number of other samples I will be taking a look at - authenticated-json-api, exif-images, moderate-images, typescript-getting-started. I see a lot of possibility here.

I do need to find and create a good way to test my functions.

If you are new to functions expect your productivity to be low, or at least slowed. The turnaround time on making a code change verifying it is working as expected in the cloud takes some time.
