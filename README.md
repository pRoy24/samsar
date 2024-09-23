
## This repo is now archived.
## Hosted version is available [here](https://app.samsar.one)

## Samsar is a video & image editor with generative image, music and speech.


This is a stale commit for the samsar motion pictures client.
This client is built primarily using ReactJS and Konva-JS.

In the hosted version, you can create, 30 FPS 1024x1024 px videos, upto 2 minutes in duration.

To run this code 
```
cp .env.example .env
yarn install
yarn

```

You should leave the API server params as is so that your local client can communicate with remote samsar servers
for generation/edit calls and server-side generation calls.



### The UI has the following features-


* **Create new video projects.**
  ![Create project](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/1.png)
  Create new video projects or open existing projects from the view projects page.


* **Generative image generations and edits.**
  ![Generate images](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/2.png)
  Generate & edit images with text-prompts using best-in-class models.


* **Generative speech using text prompts.**
  ![Text to speech](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/3.png)
  Choose from 7 different voices to generate speech using generative Text To Speech interface.


* **Generative music using text prompts.**
  ![Generative music](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/4.png)
  Create generative songs or instrumental music from text prompts.


* **Mainuplate audio layers.**
  ![Layer Duration](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/5.png)
  Easily manipulate your audio layer duration, timing and volume.

* **Custom GPT assistant for design help.**
  ![Assistant demo](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/13.png)
  Enter your idea into the assistant for help in designing storyline, theme and prompts.

* **Add scenes to your project.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/6.png)
  Add single or batch scenes with initial generation prompts for batch processing, you can also copy or delete any scene.


* **Export any frame as image.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/7.png)
  You can export any frame in your project as a 1024x1024px image. So you get an image-editor & video-editor in one.


* **Magic eraser tool.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/8.png)
  Use the magic eraser to delete parts of an image that you don't want and reveal the layer below.


* **Free-hand sketch tool.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/9.png)
  Pencil tool for doing freehand sketches or writing stuff on the canvas.


* **Select shape tool.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/10.png)
  Select a shape from the canvas to crop it out as a new layer or remove it from the existing layer.


* **Animate tools.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/11.png)
  Animate each layer in the scene individually or combine the layers to animate them together.


* **Segmentation and object detection.**
  ![Add Scenes](https://samsar-resources.s3.us-west-2.amazonaws.com/rm/12.png)
  Use smart-select to select objects in the canvas, add or remove them from the layer.


* **Smart layering within a scene.**

  Show, hide or re-arrange layers within the canvas for easy manipulation.


* **Render Video**

  Finally you can render your scenes as upto 2 min long mp4 videos and download.


More feature demoes as well as end result demoes will be added as and when I record them.

This app does not use user-data to train its own models, and bears no responsibility for usage. Read terms of service [here](https://www.samsar.one/terms).

To follow latest news and keep-up-to date with this project, follow on [Twitter](https://x.com/samsar_one).





