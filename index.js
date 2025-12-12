import express from "express";
import Parser from "rss-parser";

const app = express();
const parser = new Parser();

app.use(express.urlencoded({ extended: true }));

app.post("/slack/ytcheck", async (req, res) => {
  const hours = Number(req.body.text) || 24;
  const since = Date.now() - hours * 60 * 60 * 1000;

  const FEED_URL = "https://script.googleusercontent.com/a/macros/fastforwardvideos.com/echo?user_content_key=AehSKLhxk6crLAjWt44MS6Ydeus5qraun90Bz45WIddXtelwOgBtkc4Iv4Z8n3qo7RqkfRIVuzahSRxw8NdEKWdKh0VHISnBrScriiRkvFR4_oE4hZvqRlA-lJKEOGHwCmi9UMj0N4vL53Yjf0pGFjoBVjlf0wHgezEEabF6-UePz-GDhbWeGwx2V0h4OfKq8moKDntDJJGENv7hau9RyppluUwgA92M_WxkSYbxpGWwVtqMk7-H8dpoMENJWupl60hjnX3TPVRXXBqlucoJ1U7OozbLaeOc0G4ngD1iZD7TW4GXJ_xdhegP5oPOcNVLfw&lib=MHkiadUGsNbolhMAFY3V4OGr5Ti-DJNIB";

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
