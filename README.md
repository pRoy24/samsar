## Samsar is a video & image editor with generative image, music and speech.

This is the code for the samsar motion pictures client.
This client is built primarily using ReactJS and Konva-JS.

## Hosted version is available [here](https://app.samsar.gg)

In the hosted version, you can create, 30 FPS 1024x1024 px videos, upto 2 minutes in duration.

To run this code 
```
cp .env.example .env
yarn install
yarn

```

You should leave the API server params as is so that your local client can communicate with remote samsar servers
for generation/edit calls and server-side generation calls.


### samsar has the following features-

* Create new video projects.

Create new video projects or open existing projects from the view projects page.
![View projects demo](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/1.gif)

More feature demoes as well as end result demoes will be added as and when I record them.

This app does not use user-data to train its own models, and bears no responsibility for usage. Read terms of service [here](https://www.samsar.one/terms).

To follow latest news and keep-up-to date with this project, follow on [Twitter](https://x.com/samsar_one).





