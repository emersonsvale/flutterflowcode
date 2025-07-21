const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("/", async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).send("Missing url query parameter");

    try {
        const response = await axios({
            method: req.method,
            url,
            headers: req.headers,
            data: req.body,
            responseType: "arraybuffer",
        });

        res.set("Content-Type", response.headers["content-type"]);
        res.status(response.status).send(response.data);
    } catch (error) {
        res.status(500).send("Error in proxying request: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CORS proxy running on port ${PORT}`);
});
