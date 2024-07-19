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
![Generate video demo](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/1.gif)

* Generative image generations and edits.

Generate & edit images with text-prompts using best-in-class models.



* Generative speech using text prompts.

Choose from 7 different voices to generate speech using generative Text To Speech interface.


* Generative music using text prompts.

Create generative songs or instrumental music from text prompts.


* Mainuplate audio layers.

Easily manipulate your audio layer duration, timing and volume.


* Add scenes to your project.

Add single or batch scenes with initial generation prompts for batch processing, you can also copy or delete any scene.


* Export any frame as image.

You can export any frame in your project as a 1024x1024px image. So you get an image-editor & video-editor in one.


* Magic eraser tool.

Use the magic eraser to delete parts of an image that you don't want and reveal the layer below.


* Free-hand sketch tool.

Pencil tool for doing freehand sketches or writing stuff on the canvas.


* Select shape tool.

Select a shape from the canvas to crop it out as a new layer or remove it from the existing layer.


* Animate tools.

Animate each layer in the scene individually or combine the layers to animate them together.



More feature demoes as well as end result demoes will be added as and when I record them.

This app does not use user-data to train its own models, and bears no responsibility for usage. Read terms of service [here](https://www.samsar.one/terms).

To follow latest news and keep-up-to date with this project, follow on [Twitter](https://x.com/samsar_one).





