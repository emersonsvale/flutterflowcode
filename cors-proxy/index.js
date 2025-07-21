const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.all("/", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing url query parameter");

  try {
    const axiosConfig = {
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: new URL(url).host,
      },
      responseType: req.method === "GET" ? "arraybuffer" : "json", // binário só para GET
      data: req.method !== "GET" ? req.body : undefined,
    };

    const response = await axios(axiosConfig);

    // Define Content-Type correto
    res.set("Content-Type", response.headers["content-type"] || "application/octet-stream");
    res.status(response.status);

    // Responde binário (imagem, etc) ou JSON, dependendo do método
    if (req.method === "GET") {
      res.end(response.data, "binary");
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error("Erro no proxy:", error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data || error.message;
    res.status(status).send("Erro no proxy: " + JSON.stringify(message));
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 Proxy rodando na porta ${PORT}`);
});
