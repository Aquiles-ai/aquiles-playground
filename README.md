<h1 align="center">Aquiles-playground</h1>

![image](image/aquiles-playground.png)

<p align="center">
  <strong>Test our models locally from an easy-to-use chat interface</strong><br/>
  🚀 Nextjs • vLLM • Async • OpenAI Client
</p>

## Before running Aquiles-playground, perform these steps:

**Clone the repository and install all dependencies**

```bash
git clone https://github.com/Aquiles-ai/aquiles-playground.git
cd aquiles-playground
npm install
```

**To run the models with vLLM follow these steps**

Installing the libraries

```bash
uv pip install torch numpy packaging torchvision
```

```bash
uv pip install --upgrade transformers ftfy kernels deepspeed vllm
```

This is for the model **Qwen2.5-VL-3B-Instruct-Img2Code**

```bash
uv pip install qwen-vl-utils
```

**If you want to use flash-attn for Pytorch 2.8+**

```bash

wget https://github.com/mjun0812/flash-attention-prebuild-wheels/releases/download/v0.3.14/flash_attn-2.8.2+cu128torch2.8-cp312-cp312-linux_x86_64.whl

pip install flash_attn-2.8.2+cu128torch2.8-cp312-cp312-linux_x86_64.whl
```

#### Run our models with vLLM

**It should be noted that you can only run one model at a time.**

In case you want to run **Asclepio-8B**, a specialized model for medical reasoning and clinical decision-making:

```bash
vllm serve Aquiles-ai/Asclepio-8B \
  --host 0.0.0.0 \
  --port 8000 \
  --api-key dummyapikey \
  --max-model-len=16384 \
  --async-scheduling \
  --gpu-memory-utilization=0.90
```

In case you want to run **Qwen2.5-VL-3B-Instruct-Img2Code**, a model specialized in generating clean and functional HTML/CSS code from screenshots of web pages:

```bash
vllm serve Aquiles-ai/Qwen2.5-VL-3B-Instruct-Img2Code \
  --host 0.0.0.0 \
  --port 8000 \
  --api-key dummyapikey \
  --mm-encoder-tp-mode data \
  --limit-mm-per-prompt '{"image":2,"video":0}' \
  --max-model-len=16384 \
  --gpu-memory-utilization=0.90
```


> ⚠️ **Warning**: In the playground you can only interact with the model that you have launched with the vllm serve command, if you want to interact with the other model you have to kill the current execution and from there launch it with the indicated command

## Environment variables for Aquiles-playground

Since when starting the model servers with vLLM we get access to them through the OpenAI client, if you use the same commands that I left before you can copy the following without problems

Create a **.env.local** file in the **aquiles-playground** folder with the following:

```env
OPENAI_API_KEY="dummyapikey"
OPENAI_BASE_URL="http://127.0.0.1:8000/v1" # You change this if you are running the models in lightning.ai and you are port viewer to something like "https://8000-your-url.cloudspaces.litng.ai/v1"
```

## Run Aquiles-Playground

Run the following command and log into your localhost on port 3000

```bash
npm run dev -- -H 0.0.0.0
```

**You will see something like**

![imagepreview](image/preview.png)

