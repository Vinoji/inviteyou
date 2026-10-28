/**
 * The blog: long-form guides written for the searches couples actually make
 * ("digital wedding invitation", "Tamil wedding invitation wording",
 * "wedding invitation message for WhatsApp"…). Each post is plain data —
 * blocks rendered by app/[locale]/blog/[slug]/page.tsx — with its own SEO
 * title and description, an FAQ (schema.org FAQPage) and links into the
 * designs. Posts are written in English; the Tamil site shows the same post
 * with the English page as its canonical.
 *
 * `{price}` in any text is replaced with the live invitation's current price.
 */

export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string; id?: string }
  | { t: "h3"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "sample"; title: string; lines: string[]; lang?: "ta" | "en" }
  | { t: "tip"; text: string }
  | { t: "cta"; title: string; text: string; href: string; button: string };

export interface Post {
  slug: string;
  /** <title> — under ~60 characters, the main keyword first. */
  metaTitle: string;
  /** Meta description — under ~155 characters. */
  description: string;
  /** The share title, when the headline is the same as metaTitle. */
  ogTitle?: string;
  /** The page's H1. */
  title: string;
  /** One line under the title, and the card on the blog index. */
  excerpt: string;
  keywords: string[];
  published: string;
  updated: string;
  readMinutes: number;
  body: Block[];
  faq: { q: string; a: string }[];
}

export const POSTS: Post[] = [
  {
    slug: "digital-wedding-invitation-india",
    metaTitle: "Digital Wedding Invitation in India: Complete 2026 Guide",
    description:
      "How to make a digital wedding invitation for WhatsApp in 2 minutes — animated designs, Google Maps, RSVP and a countdown, in Tamil or English.",
    title: "Digital Wedding Invitation in India: The Complete 2026 Guide",
    excerpt:
      "Everything about online wedding invitations — what they are, what guests get, what they cost compared with printed cards, and how to make one on your phone.",
    keywords: [
      "digital wedding invitation",
      "online wedding invitation India",
      "e-invite for wedding",
      "WhatsApp wedding invitation",
      "wedding invitation website",
    ],
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 7,
    body: [
      {
        t: "p",
        text: "A few years ago a digital wedding invitation meant a JPEG forwarded on WhatsApp. Today it can be a full invitation that opens with an animation, shows your names, both families, the muhurtham, every function with Google Maps directions, a live countdown and an RSVP — all in one link your guests open on any phone, without installing an app.",
      },
      {
        t: "p",
        text: "This guide explains how digital invitations work in India, what to put in one, what it costs compared with printed cards, and how to make yours in a couple of minutes.",
      },
      { t: "h2", text: "What is a digital wedding invitation?", id: "what" },
      {
        t: "p",
        text: "A digital wedding invitation (also called an e-invite or online wedding invitation) is an invitation your guests receive and open on their phone — usually through WhatsApp. There are two kinds:",
      },
      {
        t: "ul",
        items: [
          "Image or PDF cards — a picture of a printed-style card. Easy to forward, but guests still have to type the venue into Maps, and nothing can change after you send it.",
          "Live invitation links — a small web page made for your wedding. It can open with an animation (temple doors, a pearl curtain, a wax seal), and it carries the details guests actually need: directions, timings, add-to-calendar, a countdown and an RSVP.",
        ],
      },
      { t: "h2", text: "Why couples are switching from printed cards", id: "why" },
      {
        t: "ul",
        items: [
          "It reaches everyone at once — relatives abroad, friends in other cities, colleagues — with no courier or postage.",
          "Guests get one-tap Google Maps directions to the mandapam, the reception hall or the church.",
          "Guests can add the muhurtham and reception to their phone calendar, with a reminder the day before.",
          "You see who is coming (RSVP), which helps you plan the catering and the seating.",
          "Change of hall or timing? Update the link once, and every guest sees the new details.",
          "It can be in Tamil or English, and you can still print a few cards for elders who prefer paper.",
        ],
      },
      { t: "h2", text: "Digital vs printed wedding cards: the cost", id: "cost" },
      {
        t: "p",
        text: "Printed wedding cards in India usually cost anywhere from ₹20 to well over ₹150 per card depending on the paper, foil and inserts, plus envelopes, printing time and delivery. For 300 guests that quickly adds up to thousands of rupees.",
      },
      {
        t: "p",
        text: "A live digital invitation is one price for unlimited guests. On InviteForYou a live invitation is ₹{price} — and you can download a card image of any design free, to share or print.",
      },
      {
        t: "tip",
        text: "Many families now do both: a digital invitation for everyone, and a small number of printed cards for elders and close family, handed over in person with thamboolam.",
      },
      { t: "h2", text: "What to include in your wedding invitation", id: "include" },
      {
        t: "ol",
        items: [
          "A blessing or invocation — for example உ / ஸ்ரீ விநாயகர் துணை, the Bismillah, a Bible verse or Ik Onkar.",
          "The bride's and groom's names, and their parents' names (\"Daughter of… / Son of…\").",
          "The date and the muhurtham time, written clearly with the day of the week.",
          "Each function — muhurtham, reception, mehendi, Nikah, Walima — with its time and venue.",
          "The venue address with a map link.",
          "A warm closing line and the hosts' names (\"With best compliments from…\").",
          "Optional: your love story, photos, a dress code, parking information and travel tips for outstation guests.",
        ],
      },
      { t: "h2", text: "How to make a digital wedding invitation in 2 minutes", id: "how" },
      {
        t: "ol",
        items: [
          "Pick a design. Each one has its own opening — a temple journey, temple doors, a pearl curtain, a printed pathirikai in its envelope.",
          "Type the bride's and groom's names and the date. They appear across the whole invitation at once.",
          "Add the venues and timings. Paste a Google Maps link, or let guests search the address.",
          "Add family names, your story and photos if you like — all optional.",
          "Tap Preview to watch it open exactly as your guests will see it.",
          "Publish, and share the one link on WhatsApp.",
        ],
      },
      {
        t: "cta",
        title: "Make your digital wedding invitation",
        text: "Animated openings, Google Maps, countdown and RSVP — in Tamil or English. Try any design free.",
        href: "/invitations/wedding",
        button: "See wedding designs",
      },
      { t: "h2", text: "Tips that make guests actually open it", id: "tips" },
      {
        t: "ul",
        items: [
          "Send it personally. A short message with the guest's name (\"Dear Ravi anna and family…\") gets far more replies than a forwarded link.",
          "Send it 4–6 weeks before the wedding, and a gentle reminder a week before.",
          "Keep the first screen simple: names, date, and a clear tap to open.",
          "Call elders as well — a digital invitation is a convenience, not a replacement for a personal call.",
        ],
      },
    ],
    faq: [
      {
        q: "Is it okay to send a wedding invitation on WhatsApp?",
        a: "Yes — most couples in India now invite through WhatsApp, especially guests in other cities and abroad. A personal message with the guest's name, plus a phone call to elders and close family, keeps it respectful.",
      },
      {
        q: "Do guests need to install an app to open it?",
        a: "No. A live invitation is a link that opens in the phone's browser, on Android and iPhone.",
      },
      {
        q: "Can I make the invitation in Tamil?",
        a: "Yes. You can write the whole invitation in Tamil or in English, and the designs include traditional Tamil wording such as உ and the muhurtham details.",
      },
      {
        q: "Can I change the details after sending?",
        a: "With a live invitation link, yes — update the venue, timings or photos and every guest sees the latest version through the same link.",
      },
      {
        q: "Can I also print my digital invitation?",
        a: "Yes. You can download the card image of a design free and print it for elders or close family.",
      },
    ],
  },

  {
    slug: "tamil-wedding-invitation-wording",
    ogTitle: "Copy-Ready Tamil Wedding Invitation Wording (உ to Muhurtham)",
    metaTitle: "Tamil Wedding Invitation Wording: Samples in Tamil & English",
    description:
      "Traditional Tamil wedding invitation wording (திருமண அழைப்பிதழ் வாசகம்) with samples for the muhurtham, reception and WhatsApp — in Tamil and English.",
    title: "Tamil Wedding Invitation Wording: Samples in Tamil & English",
    excerpt:
      "Traditional திருமண அழைப்பிதழ் wording, line by line — the invocation, the muhurtham sentence, the families and the closing — with ready-to-use samples.",
    keywords: [
      "Tamil wedding invitation wording",
      "திருமண அழைப்பிதழ் வாசகம்",
      "Tamil marriage invitation format",
      "Tamil wedding invitation in English",
      "muhurtham invitation wording",
    ],
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 6,
    body: [
      {
        t: "p",
        text: "A Tamil wedding invitation (திருமண அழைப்பிதழ்) follows an order that families have used for generations: a blessing at the top, the auspicious time, the couple with their parents, the venue, and a warm request to come and bless the couple. Here is that order, line by line, with samples you can copy.",
      },
      { t: "h2", text: "The traditional order of a Tamil invitation", id: "order" },
      {
        t: "ol",
        items: [
          "Invocation — உ, followed by ஸ்ரீ விநாயகர் துணை, சிவமயம் or the family deity's name.",
          "Title — திருமண அழைப்பிதழ் (Wedding Invitation) or சுபமுகூர்த்தப் பத்திரிகை.",
          "The auspicious-day sentence — நிகழும் மங்களகரமான…",
          "The groom (மணமகன்) and bride (மணமகள்) with their parents (…அவர்களின் அன்புப் புதல்வன் / புதல்வி).",
          "The muhurtham date, day and time, and the venue (இடம்).",
          "The request to attend and bless — தாங்கள் தங்கள் சுற்றமும் நட்பும் சூழ வருகை தந்து…",
          "The hosts — தங்கள் நல்வரவை விரும்பும், followed by the family names.",
        ],
      },
      { t: "h2", text: "Sample 1 — traditional Tamil wording", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "திருமண அழைப்பிதழ்",
        lines: [
          "உ",
          "ஸ்ரீ விநாயகர் துணை",
          "திருமண அழைப்பிதழ்",
          "நிகழும் மங்களகரமான சுபமுகூர்த்த நன்னாளில், இறையருளாலும் பெரியோர்களின் ஆசியாலும்",
          "திரு. ராஜேந்திரன் – திருமதி. மீனா அவர்களின் அன்புப் புதல்வன்",
          "செல்வன் அர்ஜுன்",
          "மற்றும்",
          "திரு. சுரேஷ் – திருமதி. லதா அவர்களின் அன்புப் புதல்வி",
          "செல்வி பிரியா",
          "ஆகியோருக்குத் திருமணம் நடைபெற இருப்பதால்,",
          "தாங்கள் தங்கள் சுற்றமும் நட்பும் சூழ வருகை தந்து மணமக்களை வாழ்த்தியருளுமாறு அன்புடன் அழைக்கிறோம்.",
          "முகூர்த்தம்: ஞாயிறு, 24 ஜனவரி 2027 · காலை 9.00 – 10.30",
          "இடம்: ஸ்ரீ கல்யாண மண்டபம், மயிலாப்பூர், சென்னை",
          "தங்கள் நல்வரவை விரும்பும்,",
          "இரு வீட்டார்",
        ],
      },
      { t: "h2", text: "Sample 2 — the same invitation in English", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Wedding Invitation",
        lines: [
          "|| Sri Ganeshaya Namah ||",
          "With the blessings of the Almighty and our elders,",
          "we solicit your gracious presence with family and friends at the auspicious marriage of",
          "Arjun",
          "Son of Mr. & Mrs. Rajendran",
          "with",
          "Priya",
          "Daughter of Mr. & Mrs. Suresh",
          "Muhurtham: Sunday, 24 January 2027, 9.00 – 10.30 AM",
          "Venue: Sri Kalyana Mandapam, Mylapore, Chennai",
          "With best compliments from both families",
        ],
      },
      { t: "h2", text: "Reception wording", id: "reception" },
      {
        t: "sample",
        lang: "ta",
        title: "வரவேற்பு",
        lines: [
          "திருமண வரவேற்பு",
          "சனிக்கிழமை, 23 ஜனவரி 2027 · மாலை 7.00 மணி முதல்",
          "இடம்: கிராண்ட் பால்ரூம், சென்னை",
          "தங்கள் வருகையை அன்புடன் எதிர்பார்க்கிறோம்.",
        ],
      },
      {
        t: "sample",
        lang: "en",
        title: "Reception",
        lines: [
          "Reception",
          "Saturday, 23 January 2027 · from 7.00 PM",
          "Venue: Grand Ballroom, Chennai",
          "We look forward to celebrating with you.",
        ],
      },
      { t: "h2", text: "Invitation from the couple (modern wording)", id: "couple" },
      {
        t: "sample",
        lang: "en",
        title: "From the couple",
        lines: [
          "Together with our families,",
          "Priya & Arjun",
          "invite you to celebrate our wedding",
          "Sunday, 24 January 2027 · Muhurtham 9.00 AM",
          "Sri Kalyana Mandapam, Chennai",
          "Your blessings are the greatest gift.",
        ],
      },
      { t: "h2", text: "Words to get right", id: "words" },
      {
        t: "ul",
        items: [
          "மணமகன் — groom; மணமகள் — bride.",
          "அன்புப் புதல்வன் / புதல்வி — beloved son / daughter (மகன் / மகள் is also common).",
          "சுபமுகூர்த்தம் — the auspicious time of the wedding; write the start and end time.",
          "தங்கள் நல்வரவை விரும்பும் — \"awaiting your gracious presence\", followed by the hosts.",
          "Write the day of the week with the date, and check the muhurtham against your family's panchangam.",
        ],
      },
      {
        t: "cta",
        title: "Get this wording in a ready design",
        text: "Our Tamil designs — Manjal Pathirikai, Madurai Meenakshi, Kalyanam Rituals and more — already use this traditional wording. Just type your names.",
        href: "/invitations/wedding",
        button: "See Tamil designs",
      },
    ],
    faq: [
      {
        q: "What is written at the top of a Tamil wedding invitation?",
        a: "Most Tamil invitations begin with உ (the pillaiyar suzhi), followed by ஸ்ரீ விநாயகர் துணை, சிவமயம் or the family deity's name.",
      },
      {
        q: "Should the groom or the bride be named first?",
        a: "Traditional Tamil invitations usually name the groom (மணமகன்) first and then the bride (மணமகள்), each with their parents. Many modern invitations from the couple name the bride first — both are fine.",
      },
      {
        q: "Can I send a Tamil wedding invitation on WhatsApp?",
        a: "Yes. A live invitation link keeps the Tamil wording, adds Google Maps directions and an RSVP, and opens on any phone.",
      },
    ],
  },

  {
    slug: "wedding-invitation-wording-all-religions",
    metaTitle: "Wedding Invitation Wording for Every Religion (Samples)",
    description:
      "Wedding invitation wording samples for Hindu, Christian, Muslim (Nikah), Sikh (Anand Karaj) and Jain weddings — with the right blessing for each.",
    title: "Wedding Invitation Wording for Hindu, Christian, Muslim, Sikh & Jain Weddings",
    excerpt:
      "The right opening blessing, the order of names and ready-to-use samples for every tradition — from Holy Matrimony to Nikah and Anand Karaj.",
    keywords: [
      "wedding invitation wording",
      "Christian wedding invitation wording",
      "Nikah invitation wording",
      "Sikh wedding card wording",
      "Jain wedding invitation wording",
    ],
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 7,
    body: [
      {
        t: "p",
        text: "Every tradition opens its wedding invitation with its own blessing and follows its own order. Getting these right is what makes an invitation feel proper to elders. Here is the wording for each, with samples you can adapt.",
      },
      { t: "h2", text: "Hindu wedding invitation wording", id: "hindu" },
      {
        t: "p",
        text: "Hindu invitations usually open with a prayer to Lord Ganesha — || Sri Ganeshaya Namah || or, in Tamil, உ / ஸ்ரீ விநாயகர் துணை — then the couple with their parents, the muhurtham and the venue.",
      },
      {
        t: "sample",
        title: "Hindu",
        lines: [
          "|| Sri Ganeshaya Namah ||",
          "With the blessings of the Almighty and our elders,",
          "we cordially invite you to the wedding of",
          "Arjun (Son of Mr. & Mrs. Rajendran)",
          "with",
          "Priya (Daughter of Mr. & Mrs. Suresh)",
          "Muhurtham: Sunday, 24 January 2027, 9.00 AM",
          "Sri Kalyana Mandapam, Chennai",
        ],
      },
      { t: "h2", text: "Christian wedding invitation wording", id: "christian" },
      {
        t: "p",
        text: "Christian invitations often begin with a Bible verse — Matthew 19:6 (\"What therefore God hath joined together, let not man put asunder\") and 1 Corinthians 13 are favourites — and call the ceremony Holy Matrimony, with the church named as the venue.",
      },
      {
        t: "sample",
        title: "Christian",
        lines: [
          "“What therefore God hath joined together, let not man put asunder.” — Matthew 19:6",
          "By the abundant grace of our Lord Jesus Christ,",
          "we joyfully invite you to witness the holy matrimony of",
          "Joseph (Son of Mr. & Mrs. George Varghese)",
          "with",
          "Anna (Daughter of Mr. & Mrs. Thomas Mathew)",
          "Saturday, 19 December 2026, 10.30 AM",
          "St. Mary's Cathedral Basilica, Kochi",
          "Reception to follow",
        ],
      },
      { t: "h2", text: "Muslim (Nikah) invitation wording", id: "nikah" },
      {
        t: "p",
        text: "Nikah invitations open with the Bismillah — بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ, \"In the name of Allah, the Most Gracious, the Most Merciful\" — and usually invite guests to both the Nikah and the Walima.",
      },
      {
        t: "sample",
        title: "Nikah",
        lines: [
          "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
          "With the blessings of Allah (SWT),",
          "we request the honour of your presence at the Nikah of",
          "Imran (Son of Mr. & Mrs. Mohammed Farooq Khan)",
          "with",
          "Ayesha (Daughter of Mr. & Mrs. Syed Anwar Hussain)",
          "Nikah: Saturday, 16 January 2027, 11.00 AM",
          "Walima: 7.30 PM",
          "Your duas and presence will be our greatest blessing.",
        ],
      },
      { t: "h2", text: "Sikh (Anand Karaj) invitation wording", id: "sikh" },
      {
        t: "p",
        text: "Sikh invitations often carry the Ik Onkar symbol (ੴ) and \"With the blessings of Waheguru Ji\". Many gurdwaras ask that Gurbani not be printed on cards, since cards can end up discarded — so keep to Ik Onkar and a blessing line, and check with your gurdwara.",
      },
      {
        t: "sample",
        title: "Anand Karaj",
        lines: [
          "ੴ",
          "With the blessings of Waheguru Ji",
          "we request the pleasure of your company at the Anand Karaj of",
          "Simran Kaur (Daughter of S. Gurcharan Singh & Smt. Jaspreet Kaur)",
          "with",
          "Navdeep Singh (Son of S. Harjeet Singh & Smt. Manpreet Kaur)",
          "Sunday, 21 February 2027, 10.00 AM",
          "Gurdwara Sahib, Amritsar · followed by langar",
        ],
      },
      { t: "h2", text: "Jain wedding invitation wording", id: "jain" },
      {
        t: "p",
        text: "Jain invitations often begin with the first line of the Namokar Mantra — ॥ णमो अरिहंताणं ॥ — and \"Jai Jinendra\", and many mention that meals are pure Jain and served before sunset.",
      },
      {
        t: "sample",
        title: "Jain",
        lines: [
          "॥ णमो अरिहंताणं ॥",
          "Jai Jinendra",
          "With the blessings of the Tirthankaras and our elders,",
          "we cordially invite you to the auspicious wedding of",
          "Khushi (Daughter of Shri Nilesh Shah & Smt. Bhavna Shah)",
          "with",
          "Parth (Son of Shri Rajesh Mehta & Smt. Hetal Mehta)",
          "Sunday, 31 January 2027, 11.15 AM",
        ],
      },
      {
        t: "cta",
        title: "Printed-card designs for every tradition",
        text: "Manjal Pathirikai, Emerald Nikah, Ivory Holy Matrimony, Anand Karaj, Jain Namokar and more — each with its tradition's blessing and wording built in.",
        href: "/invitations/wedding",
        button: "See all designs",
      },
    ],
    faq: [
      {
        q: "Whose name comes first on a wedding invitation?",
        a: "It varies by tradition and family. Tamil, Christian and Nikah invitations often name the groom first; many North Indian, Sikh and modern couple-hosted invitations name the bride first. Follow your family's custom.",
      },
      {
        q: "Can I print a Bible verse or the Bismillah on a digital invitation?",
        a: "Yes. A digital invitation keeps the verse or the Bismillah at the top, just like a printed card.",
      },
      {
        q: "Should I print Gurbani on a Sikh wedding card?",
        a: "Many gurdwaras ask couples not to print Gurbani on invitations, because cards can be discarded. Ik Onkar and a blessing line are a respectful alternative — check with your gurdwara.",
      },
    ],
  },

  {
    slug: "whatsapp-wedding-invitation-message",
    ogTitle: "What to Send With Your Wedding Invite on WhatsApp",
    metaTitle: "WhatsApp Wedding Invitation Messages: 15 Samples to Send",
    description:
      "Ready-to-send wedding invitation messages for WhatsApp — for relatives, friends, colleagues and elders, in English and Tamil, plus reminder messages.",
    title: "WhatsApp Wedding Invitation Messages: 15 Samples to Send",
    excerpt:
      "Polite, warm messages to send with your wedding invitation on WhatsApp — for relatives, friends, office colleagues and elders, in English and Tamil.",
    keywords: [
      "wedding invitation message for WhatsApp",
      "marriage invitation message",
      "wedding invitation text message",
      "Tamil wedding invitation message",
      "wedding reminder message",
    ],
    published: "2026-10-21",
    updated: "2026-10-21",
    readMinutes: 5,
    body: [
      {
        t: "p",
        text: "The message you send with your invitation matters as much as the invitation itself. A personal line with the guest's name feels like a call; a bare forwarded link feels like a broadcast. Here are messages you can copy, change the names and send.",
      },
      { t: "h2", text: "For relatives", id: "relatives" },
      {
        t: "sample",
        title: "Relatives",
        lines: [
          "Dear Chithi and family 🙏",
          "With the blessings of our elders, Priya and Arjun are getting married on Sunday, 24 January 2027 in Chennai.",
          "Our invitation is here — it has the muhurtham, the venue map and everything else: [link]",
          "Your presence and blessings mean everything to us. Please do come with family.",
        ],
      },
      { t: "h2", text: "For friends", id: "friends" },
      {
        t: "sample",
        title: "Friends",
        lines: [
          "Hey Karthik! 🎉",
          "It's official — Priya and I are getting married on 24 Jan in Chennai!",
          "Here's our invite (open it, it's fun 😄): [link]",
          "You HAVE to be there. Reply on the invite so we know you're coming!",
        ],
      },
      { t: "h2", text: "For office colleagues", id: "office" },
      {
        t: "sample",
        title: "Colleagues",
        lines: [
          "Hi team,",
          "I'm happy to share that I'm getting married on Sunday, 24 January 2027 in Chennai.",
          "You're warmly invited to the reception on Saturday, 23 January at 7 PM — details and directions here: [link]",
          "It would be lovely to celebrate with you all.",
        ],
      },
      { t: "h2", text: "For elders (formal)", id: "elders" },
      {
        t: "sample",
        title: "Elders",
        lines: [
          "Respected Mama and Mami,",
          "With your blessings, our daughter Priya's wedding to Arjun is fixed for Sunday, 24 January 2027, muhurtham 9.00 – 10.30 AM, at Sri Kalyana Mandapam, Mylapore.",
          "Please find the invitation here: [link]",
          "We humbly request you to come with family and bless the couple.",
        ],
      },
      { t: "h2", text: "In Tamil", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "தமிழில்",
        lines: [
          "அன்புள்ள மாமா, அத்தை 🙏",
          "பெரியோர்களின் ஆசியுடன் எங்கள் மகள் பிரியாவுக்கும் அர்ஜுனுக்கும் 24 ஜனவரி 2027 ஞாயிறு அன்று சென்னையில் திருமணம் நடைபெற உள்ளது.",
          "அழைப்பிதழ் இங்கே: [link]",
          "தாங்கள் குடும்பத்துடன் வருகை தந்து மணமக்களை வாழ்த்த வேண்டுகிறோம்.",
        ],
      },
      { t: "h2", text: "Reminder message (one week before)", id: "reminder" },
      {
        t: "sample",
        title: "Reminder",
        lines: [
          "Just one week to go! 🎊",
          "Priya & Arjun's wedding — Sunday, 24 January, muhurtham 9.00 AM.",
          "Directions and timings: [link]",
          "Can't wait to see you there!",
        ],
      },
      { t: "h2", text: "Etiquette tips", id: "etiquette" },
      {
        t: "ul",
        items: [
          "Always use the guest's name — never forward the same message to everyone.",
          "Send 4–6 weeks before, then a reminder a week before the wedding.",
          "For elders and close family, call them as well — the message is the follow-up, not the invitation.",
          "Avoid sending late at night; morning or early evening is best.",
          "Use a link that opens straight away, with the map and timings inside, so nobody has to ask \"where is the hall?\".",
        ],
      },
      {
        t: "cta",
        title: "Make the link worth opening",
        text: "A live invitation opens with an animation, shows your names and has Google Maps and RSVP inside. Try any design free.",
        href: "/invitations/wedding",
        button: "Create your invitation",
      },
    ],
    faq: [
      {
        q: "When should I send wedding invitations on WhatsApp?",
        a: "Four to six weeks before the wedding is ideal, with a short reminder a week before. Outstation and overseas guests appreciate more notice.",
      },
      {
        q: "Is a WhatsApp invitation enough for elders?",
        a: "For elders and close relatives, call them or invite them in person as well; the WhatsApp invitation then gives them the date, timings and directions to keep.",
      },
    ],
  },
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
