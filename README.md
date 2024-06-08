## Samsar is an open-source video & image editor.

## Hosted version is available [here](https://app.samsar.gg)

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

* Add scenes to your scene on the fly with gen-ai
![Gen AI demo](https://im-embeddings.s3.us-west-2.amazonaws.com/generate_artefacts.gif)

* Select parts of an image to create a new layer and animate.

* Magic eraser to delete parts of the image and expose layers below.
![Magic eraser demo](https://im-embeddings.s3.us-west-2.amazonaws.com/eraser_low_res_1.gif)

* Add audio to your slideshow.


* Download and publish.