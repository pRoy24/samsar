# Samsar motion pictures client code

## Samsar is an open-source video & image editor.

## Hosted version is available here - https://app.samsar.gg

To run this code 
```
cp .env.eample .env
yarn install
yarn

```

You should leave the API server params as is so that your local client can communicate with remote samsar servers
for generation/edit calls.

samsar has the following features-
* Add scenes via text-prmpt
Queue multiple renditions together by chaining prompts.

* Generate/edit scenes for the slide-show via gen-ai

* Select parts of an image to create a new layer and animate.

* Magic eraser to delete parts of the image and expose layers below.

* Add audio to your slideshow.

* Download and publish.