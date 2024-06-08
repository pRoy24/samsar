## Samsar is an open-source video & image editor.

## Hosted version is available [here](https://app.samsar.gg)

This is the code for the samsar motion pictures client.
To run this code 
```
cp .env.eample .env
yarn install
yarn

```

You should leave the API server params as is so that your local client can communicate with remote samsar servers
for generation/edit calls and server-side generation calls.

samsar has the following features-
* Add scenes via text-prmpt
Batch multiple scene renditions by chaining prompts.
![Multi prompt demo](https://im-embeddings.s3.us-west-2.amazonaws.com/multi_prompt.gif)

* Audio with waveform for easy visualization.
![Add audio demo](https://im-embeddings.s3.us-west-2.amazonaws.com/3_audio.gif)

* Add scenes to your scene on the fly with gen-ai
![Gen AI demo](https://im-embeddings.s3.us-west-2.amazonaws.com/generate_artefacts.gif)

* Magic eraser to delete parts of the image and expose layers below.
![Magic eraser demo](https://im-embeddings.s3.us-west-2.amazonaws.com/eraser_low_res_1.gif)

* Easy frame-by-frame scene manipulation
![Scene manipulation demo](https://im-embeddings.s3.us-west-2.amazonaws.com/layer_seek.gif)


