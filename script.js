const backendUrl = "https://absorption-score-barrier-vintage.trycloudflare.com";

function generateImage() {
    const positive = document.getElementById("positivePrompt").value;
    const negative = document.getElementById("negativePrompt").value;
    const seed = parseInt(document.getElementById("seed").value);

    const workflow = {
        "3": {
            "inputs": {
                "seed": seed,
                "steps": 10,
                "cfg": 1.5,
                "sampler_name": "dpmpp_2m_sde",
                "scheduler": "exponential",
                "denoise": 1,
                "model": ["4", 0],
                "positive": ["30", 0],
                "negative": ["33", 0],
                "latent_image": ["5", 0]
            },
            "class_type": "KSampler"
        },
        "4": { "inputs": { "ckpt_name": "dreamshaperXL_v21TurboDPMSDE.safetensors" }, "class_type": "CheckpointLoaderSimple" },
        "5": { "inputs": { "width": 1024, "height": 1024, "batch_size": 1 }, "class_type": "EmptyLatentImage" },
        "8": { "inputs": { "samples": ["3", 0], "vae": ["39", 0] }, "class_type": "VAEDecode" },
        "28": { "inputs": { "filename_prefix": "gradio/output", "images": ["41", 0] }, "class_type": "SaveImage" },
        "30": {
            "inputs": { "width": 4096, "height": 4096, "crop_w": 0, "crop_h": 0, "target_width": 4096, "target_height": 4096, "text_g": positive, "text_l": positive, "clip": ["63", 1] },
            "class_type": "CLIPTextEncodeSDXL"
        },
        "33": {
            "inputs": { "width": 4096, "height": 4096, "crop_w": 0, "crop_h": 0, "target_width": 4096, "target_height": 4096, "text_g": negative, "text_l": negative, "clip": ["63", 1] },
            "class_type": "CLIPTextEncodeSDXL"
        },
        "39": { "inputs": { "vae_name": "sdxl_vae.safetensors" }, "class_type": "VAELoader" },
        "40": { "inputs": { "model_name": "GFPGANv1.4.pth" }, "class_type": "FaceRestoreModelLoader" },
        "41": { "inputs": { "facedetection": "YOLOv5l", "codeformer_fidelity": 0.5, "facerestore_model": ["40", 0], "image": ["8", 0] }, "class_type": "FaceRestoreCFWithModel" },
        "63": { "inputs": { "lora_name": "MJ52_v2.0.safetensors", "strength_model": 0.6, "strength_clip": 0.3, "model": ["4", 0], "clip": ["4", 1] }, "class_type": "LoraLoader" }
    };

    document.getElementById("result").innerText = "Generazione in corso...";
    document.getElementById("generatedImage").src = "";

    fetch(`${backendUrl}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow)
    })
    .then(res => res.json())
    .then(data => {
        console.log("Risultato:", data);

        // Trova il percorso immagine nella risposta
        if (data?.images && data.images.length > 0) {
            const imagePath = data.images[0].filename;  // Es: 'output/gradio/immagine.png'
            const imageUrl = `${backendUrl}/view?filename=${encodeURIComponent(imagePath)}`;

            document.getElementById("generatedImage").src = imageUrl;
            document.getElementById("result").innerText = "Immagine generata:";
        } else {
            document.getElementById("result").innerText = "Nessuna immagine trovata nella risposta.";
        }
    })
    .catch(err => {
        console.error(err);
        document.getElementById("result").innerText = "Errore durante la generazione.";
    });
}

