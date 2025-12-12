import express from "express";
import Parser from "rss-parser";

const app = express();
const parser = new Parser();

app.use(express.urlencoded({ extended: true }));

app.post("/slack/ytcheck", async (req, res) => {
  const hours = Number(req.body.text) || 24;
  const since = Date.now() - hours * 60 * 60 * 1000;

  const FEED_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";

  try {
    const feed = await parser.parseURL(FEED_URL);

    const recent = feed.items.filter(item => {
      const date = item.isoDate || item.pubDate;
      return date && new Date(date).getTime() > since;
    });

    if (recent.length === 0) {
      return res.json({
        response_type: "ephemeral",
        text: `No new videos in the last ${hours} hours.`
      });
    }

    const message = recent.map(v =>
      `• *${v.title}*\n${v.link}`
    ).join("\n\n");

    return res.json({
      response_type: "in_channel",
      text: `New YouTube uploads (last ${hours}h):\n\n${message}`
    });

  } catch (err) {
    return res.json({
      response_type: "ephemeral",
      text: "Error reading the YouTube feed."
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
