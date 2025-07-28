# Full-Stack Generative Server with Agent and Studio (Test Preview)

Run your private generative cloud with your own API keys.
Full-control over access and storage.
One-time purchase license, downnload minor updates for free.
We also provide support regarding models and configurations.
Join our discord for support.

⚠️ **Currently in test-preview.** Message us for access.

Visit our GA web-app at https://app.samsar.one

Join our [Discord community](https://discord.gg/MSGZCuxx) for early access and updates.

---

## 🧠 Overview

This repository provides containers for running the **Generative Agent + Studio pipeline** in professional or enterprise server environments.

Download and run the Docker images with your own environment configurations.

---

## 🚀 Installation

1. Ensure Docker is installed on your system.
2. Acquire the API keys for the models you wish to use.
3. Run the containers using:

```bash
docker compose up
```

---

## 🔐 Environment Variables Setup

Configure the following environment variables before starting:

### 🔹 OpenAI Keys

* Required for agent inference.
* The studio lets you choose between different OpenAI models.

### 🔹 Fal AI Keys

* Most media models (image, video, etc.) use Fal AI for inference.
* Add your **Fal API key** to the environment.

### 🔹 Azure Keys

* Required for using models like **Sora**.
* Add both the **Azure endpoint URL** and the **API key**.

> Example:
> Access Sora via [Azure Foundry Sora](https://ai.azure.com/explore/models/sora/version/2025-05-02/registry/azure-openai)

> For other models, get the corresponding connection strings and endpoints from Azure.

### 🔹 Replicate Keys

* Needed if you plan to use **Audiocraft** as the music generation model.

---

## 📦 Storage Configuration

* Add **AWS Access Keys** for storing media (videos, frame images, etc.).
* Also configure a **CloudFront URL** for accessing stored assets.

---

Let me know if you want this version saved as a file or want it tailored to a specific use case (e.g. enterprise onboarding, local dev setup, etc.).
