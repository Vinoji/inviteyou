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
  | { t: "sample"; title: string; lines: string[]; lang?: "ta" | "en" | "ml" }
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
  /** Posts to suggest first under "More guides"; the rest fill up to four. */
  related?: string[];
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

  {
    slug: "kerala-wedding-invitation-wording",
    metaTitle: "Kerala Wedding Invitation Wording: Hindu, Christian, Muslim",
    description:
      "Kerala wedding invitation wording with samples in Malayalam and English — Hindu, Kerala Christian and Kerala Muslim Nikah — plus what to include.",
    ogTitle: "Kerala Wedding Invitation Wording You Can Copy",
    title: "Kerala Wedding Invitation Wording: Samples for Hindu, Christian & Muslim Weddings",
    excerpt:
      "Copy-ready Kerala wedding invitation wording in Malayalam and English — the traditional Hindu card, the Kerala Christian card with a verse, and the Kerala Muslim Nikah card.",
    keywords: [
      "Kerala wedding invitation wording",
      "Malayalam wedding invitation",
      "Kerala Christian wedding invitation",
      "Kerala Muslim wedding invitation",
      "kalyanakkuri",
    ],
    published: "2026-11-07",
    updated: "2026-11-07",
    readMinutes: 6,
    related: ["wedding-invitation-wording-all-religions", "whatsapp-wedding-invitation-message", "wedding-reception-invitation-message"],
    body: [
      {
        t: "p",
        text: "A Kerala wedding invitation — the kalyanakkuri — is usually simple and graceful: cream or kasavu-gold paper, a nilavilakku, a cross or a crescent at the top, and a few warm, formal lines. Hindu, Christian and Muslim families in Kerala each have their own wording. Here are samples for all three, in Malayalam and English, that you can copy and adapt.",
      },
      { t: "h2", text: "What a Kerala invitation includes", id: "include" },
      {
        t: "ol",
        items: [
          "A blessing at the top — a nilavilakku or ഓം, a cross and a Bible verse, or the Bismillah.",
          "The parents' names and their house name and place — in Kerala the tharavadu or house name matters, so include it.",
          "The bride and groom, with \"daughter of\" and \"son of\".",
          "The muhurtham or service time, with the date and day.",
          "The venue — the temple, auditorium, church or masjid — with the town.",
          "The request to attend and bless the couple, and the family names at the foot.",
        ],
      },
      { t: "h2", text: "Kerala Hindu wedding — Malayalam", id: "hindu-malayalam" },
      {
        t: "sample",
        lang: "ml",
        title: "വിവാഹ ക്ഷണക്കത്ത്",
        lines: [
          "ഓം",
          "ശുഭവിവാഹം",
          "ആലപ്പുഴ, ശ്രീനിലയത്തിൽ ശ്രീ. രാജൻ – ശ്രീമതി. ലത ദമ്പതികളുടെ മകൾ",
          "പ്രിയ",
          "യും",
          "തൃശ്ശൂർ, കൃഷ്ണകൃപയിൽ ശ്രീ. മോഹനൻ – ശ്രീമതി. ഗീത ദമ്പതികളുടെ മകൻ",
          "അർജുൻ",
          "ഉം തമ്മിലുള്ള വിവാഹം 2027 ജനുവരി 24 ഞായറാഴ്ച രാവിലെ 10.30-നും 11.00-നും മദ്ധ്യേയുള്ള ശുഭമുഹൂർത്തത്തിൽ ഗുരുവായൂർ ശ്രീകൃഷ്ണ ക്ഷേത്രസന്നിധിയിൽ വെച്ച് നടത്തുവാൻ നിശ്ചയിച്ചിരിക്കുന്നു.",
          "ഈ മംഗളകർമ്മത്തിൽ സകുടുംബം പങ്കെടുത്ത് വധൂവരന്മാരെ അനുഗ്രഹിക്കണമെന്ന് സാദരം അപേക്ഷിക്കുന്നു.",
          "സ്നേഹപൂർവ്വം, രാജൻ & ലത",
        ],
      },
      { t: "h2", text: "Kerala Hindu wedding — English", id: "hindu-english" },
      {
        t: "sample",
        lang: "en",
        title: "Wedding Invitation",
        lines: [
          "Om",
          "Mr. Rajan & Mrs. Latha, Sreenilayam, Alappuzha",
          "request the pleasure of your company with family at the marriage of their daughter",
          "Priya",
          "with",
          "Arjun",
          "son of Mr. Mohanan & Mrs. Geetha, Krishnakripa, Thrissur",
          "on Sunday, 24 January 2027, between 10.30 and 11.00 AM",
          "at Sree Krishna Temple, Guruvayur",
          "Lunch at Sree Krishna Auditorium, Guruvayur",
          "With best compliments from family and friends",
        ],
      },
      { t: "h2", text: "Kerala Christian wedding", id: "christian" },
      {
        t: "p",
        text: "Kerala Christian invitations — Syro-Malabar, Latin, Orthodox, Jacobite, Marthoma, CSI — usually open with a cross and a verse, name the parish, and invite guests to the Holy Matrimony followed by the reception in the parish hall. Check the exact form with your parish, as each church has its own custom.",
      },
      {
        t: "sample",
        lang: "en",
        title: "Holy Matrimony",
        lines: [
          "✝",
          "\"Love never fails.\" — 1 Corinthians 13:8",
          "Mr. Thomas Mathew & Mrs. Annie Thomas, Puthenpurackal House, Kottayam",
          "joyfully invite you with family to the Holy Matrimony of their daughter",
          "Anna",
          "with",
          "Joel",
          "son of Mr. George Varghese & Mrs. Mary George, Kalathil House, Kochi",
          "on Monday, 25 January 2027 at 11.00 AM",
          "at St. Mary's Church, Kottayam",
          "followed by reception at the Parish Hall",
          "Your presence and prayers are our blessing",
        ],
      },
      { t: "h2", text: "Kerala Muslim Nikah", id: "muslim" },
      {
        t: "p",
        text: "A Kerala Muslim invitation opens with the Bismillah, names the families and their place, and gives the Nikah time and the masjid or hall, often with the wedding feast (salkaram) after. Many families also add a separate line for the bride's side function.",
      },
      {
        t: "sample",
        lang: "en",
        title: "Nikah",
        lines: [
          "بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ",
          "In the name of Allah, the Most Gracious, the Most Merciful",
          "Mr. Abdul Rahman & Mrs. Sainaba, Manzil House, Kozhikode",
          "cordially invite you and your family to the Nikah of their daughter",
          "Fathima",
          "with",
          "Imran",
          "son of Mr. Basheer & Mrs. Ayisha, Malappuram",
          "In sha Allah, on Sunday, 24 January 2027 at 11.00 AM",
          "at Juma Masjid, Kozhikode",
          "Salkaram at Al Ameen Convention Centre from 12.30 PM",
          "Your presence and duas will make the day complete",
        ],
      },
      {
        t: "tip",
        text: "Kerala families often send one invitation for the wedding and lunch, and a separate one for the reception at the groom's place. A live invitation can carry both functions, each with its own time and Google Maps link.",
      },
      {
        t: "cta",
        title: "Kerala wedding designs",
        text: "Kasavu gold cards with a nilavilakku, Kerala Christian cards with a cross and verse, and Kerala Muslim Nikah cards — in English or Malayalam names.",
        href: "/invitations/kerala-wedding-invitation",
        button: "See Kerala designs",
      },
      { t: "h2", text: "Wording tips", id: "tips" },
      {
        t: "ul",
        items: [
          "Write the house name with the place — \"Sreenilayam, Alappuzha\" — guests from the family circle recognise it at once.",
          "Give the muhurtham as a window (10.30 – 11.00 AM) so guests know when to be seated.",
          "Mention the sadya or lunch venue if it is different from the ceremony.",
          "Show the wording to elders or your priest, vicar or imam before you print or send it.",
        ],
      },
    ],
    faq: [
      {
        q: "What is a Kerala wedding invitation called?",
        a: "It is commonly called a kalyanakkuri or kalyana kathu (വിവാഹ ക്ഷണക്കത്ത്) in Malayalam.",
      },
      {
        q: "Should a Kerala invitation be in Malayalam or English?",
        a: "Both are common. Many families print Malayalam on one side and English on the other; a digital invitation can be shared in whichever the guest reads best.",
      },
      {
        q: "What colours are used for Kerala wedding cards?",
        a: "Cream or off-white with a gold kasavu border is the classic look, often with a nilavilakku, a cross or a crescent in gold.",
      },
    ],
  },

  {
    slug: "wedding-hashtag-ideas",
    metaTitle: "Wedding Hashtag Ideas: 50+ Tamil & Indian Wedding Hashtags",
    description:
      "50+ wedding hashtag ideas for Indian couples — Tamil, Malayalam, Telugu, Punjabi, Christian and Nikah — with formulas to make your own unique hashtag.",
    ogTitle: "50+ Wedding Hashtags (and How to Make Your Own)",
    title: "Wedding Hashtag Ideas: 50+ Tamil & Indian Hashtags, and How to Make Yours",
    excerpt:
      "Formulas and examples for a wedding hashtag that is short, unique and easy to type — in Tamil, Malayalam, Telugu, Punjabi and English — and where to use it.",
    keywords: [
      "wedding hashtag ideas",
      "Tamil wedding hashtags",
      "Indian wedding hashtags",
      "wedding hashtag generator",
      "unique wedding hashtag",
    ],
    published: "2026-11-07",
    updated: "2026-11-07",
    readMinutes: 5,
    related: ["whatsapp-wedding-invitation-message", "digital-wedding-invitation-india", "wedding-reception-invitation-message"],
    body: [
      {
        t: "p",
        text: "A wedding hashtag gathers every photo and reel your guests post into one place — the mehendi selfies, the muhurtham, the reception dance. The best ones are short, easy to spell and unique to you. Below are formulas that work, with examples using a sample couple, Priya and Arjun — swap in your own names.",
      },
      { t: "h2", text: "Five formulas that always work", id: "formulas" },
      {
        t: "ol",
        items: [
          "Names + weds: #PriyaWedsArjun, #ArjunWedsPriya",
          "Blended names: #ArPriya, #PriyArjun, #TheArPriyaWedding",
          "Names + the word for wedding: #PriyaArjunKalyanam, #PriyaArjunShaadi, #PriyaArjunVivah",
          "Names + a pun or phrase: #ArjunFoundHisPriya, #PriyaSaidYes, #HappilyEverArjun",
          "Names + the year: #PriyaArjun2027, #ArPriya27",
        ],
      },
      { t: "h2", text: "Tamil wedding hashtags", id: "tamil" },
      {
        t: "ul",
        items: [
          "#PriyaArjunKalyanam",
          "#ArjunPriyaThirumanam",
          "#PriyaArjunMuhurtham",
          "#ArjunKaipidithaPriya",
          "#ArPriyaKalyanaVaibhogam",
          "#PriyaArjunNichayam (for the engagement)",
          "#KalyanaSamayalByArPriya (for the food photos)",
          "#PriyaArjunMaapillaiAzhaippu",
        ],
      },
      { t: "h2", text: "Kerala, Telugu and Kannada hashtags", id: "south" },
      {
        t: "ul",
        items: [
          "#PriyaArjunKalyanam (Malayalam and Telugu both use kalyanam)",
          "#ArjunPriyaMangalyam",
          "#PriyaArjunSadya",
          "#ArjunPriyaPelli",
          "#PriyaArjunPellisandadi",
          "#ArjunPriyaMaduve",
        ],
      },
      { t: "h2", text: "North Indian and Punjabi hashtags", id: "north" },
      {
        t: "ul",
        items: [
          "#ArjunKiPriya",
          "#PriyaKaArjun",
          "#ArjunDiPriya",
          "#PriyaArjunKiShaadi",
          "#ShaadiOfArPriya",
          "#ArPriyaKaBaraat",
          "#PriyaKiMehendi",
          "#ArjunDaViyah",
        ],
      },
      { t: "h2", text: "Christian and Nikah hashtags", id: "christian-nikah" },
      {
        t: "ul",
        items: [
          "#AnnaAndJoelSayIDo",
          "#JoelFoundHisAnna",
          "#ForeverAnnaJoel",
          "#TheJoelAnnaWedding",
          "#FathimaImranNikah",
          "#ImranAndFathimaQubool",
          "#FathimaImranWalima",
        ],
      },
      { t: "h2", text: "Fun and cute hashtags", id: "fun" },
      {
        t: "ul",
        items: [
          "#PriyaMadeArjunHerPlusOne",
          "#ArPriyaForever",
          "#FromPriyaToMrsArjun",
          "#OnceUponAPriya",
          "#ArjunPutARingOnIt",
          "#PriyaArjunTieTheKnot",
          "#TwoBecomeArPriya",
        ],
      },
      { t: "h2", text: "Hashtags for each function", id: "functions" },
      {
        t: "ul",
        items: [
          "Engagement: #PriyaArjunNichayam, #ArPriyaRoka, #ArjunPutARingOnIt",
          "Haldi and mehendi: #PriyaKiMehendi, #ArPriyaHaldi, #PriyaArjunNalangu",
          "Wedding day: #PriyaWedsArjun",
          "Reception: #ArPriyaReception, #PriyaArjunNightOut",
          "One tag for everything is simpler — add a function tag only if you want separate albums.",
        ],
      },
      { t: "h2", text: "How to check and use your hashtag", id: "use" },
      {
        t: "ol",
        items: [
          "Search it on Instagram first. If other couples' photos show up, add the year or a word (#PriyaArjun2027).",
          "Write it in CamelCase — #PriyaWedsArjun is easier to read than #priyawedsarjun.",
          "Avoid letters that can be misread together, and keep it under about 20 characters.",
          "Put it on the invitation, the welcome board, the photo booth and the table cards.",
          "Ask one cousin to remind everyone on the family WhatsApp group.",
        ],
      },
      {
        t: "cta",
        title: "Put your hashtag on your invitation",
        text: "A live invitation can show your hashtag under your names, with your love story, photos, Google Maps and RSVP. Try any design free.",
        href: "/invitations/wedding",
        button: "See wedding designs",
      },
    ],
    faq: [
      {
        q: "How do I make a unique wedding hashtag?",
        a: "Combine both names with a word for wedding (kalyanam, shaadi, weds) or a short pun, then search it on Instagram. If it is already used, add the year or your blended name.",
      },
      {
        q: "Where should I put our wedding hashtag?",
        a: "On the invitation, the welcome board, the photo booth, table cards and in the family WhatsApp group — wherever guests will see it before they post.",
      },
      {
        q: "Should we use one hashtag or one per function?",
        a: "One hashtag is easiest for guests. Use separate function tags only if you want separate albums for the mehendi, wedding and reception.",
      },
    ],
  },

  {
    slug: "engagement-invitation-wording",
    metaTitle: "Engagement Invitation Wording: Nichayathartham Samples",
    description:
      "Engagement invitation wording samples — Tamil nichayathartham, English ring ceremony, formal, casual and WhatsApp messages you can copy and send.",
    ogTitle: "Engagement & Nichayathartham Invitation Wording",
    title: "Engagement Invitation Wording: Nichayathartham, Ring Ceremony & WhatsApp Samples",
    excerpt:
      "Copy-ready engagement invitation wording — a traditional Tamil nichayathartham pathirikai, English ring-ceremony cards, casual lines and WhatsApp messages.",
    keywords: [
      "engagement invitation wording",
      "nichayathartham invitation",
      "ring ceremony invitation",
      "engagement invitation message",
      "நிச்சயதார்த்த அழைப்பிதழ்",
    ],
    published: "2026-11-07",
    updated: "2026-11-07",
    readMinutes: 6,
    related: ["tamil-wedding-invitation-wording", "whatsapp-wedding-invitation-message", "wedding-hashtag-ideas"],
    body: [
      {
        t: "p",
        text: "The engagement — nichayathartham in Tamil Nadu, roka or sagai in the north, ring ceremony everywhere — is when the two families formally agree to the wedding. The invitation is usually smaller and warmer than the wedding card, and often goes only to close family and friends. Here are samples for every style.",
      },
      { t: "h2", text: "What to include", id: "include" },
      {
        t: "ul",
        items: [
          "A blessing at the top (உ, Sri Ganeshaya Namah, a cross, the Bismillah) — optional for a casual card.",
          "The couple's names, with their parents' names.",
          "What the function is — nichayathartham, ring ceremony, betrothal.",
          "Date, day and time; for a nichayathartham, the nalla neram window.",
          "Venue with a map link, and whether lunch or dinner follows.",
        ],
      },
      { t: "h2", text: "Traditional Tamil nichayathartham", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "நிச்சயதார்த்த அழைப்பிதழ்",
        lines: [
          "உ",
          "ஸ்ரீ விநாயகர் துணை",
          "நிச்சயதார்த்த அழைப்பிதழ்",
          "நிகழும் மங்களகரமான நன்னாளில், இறையருளாலும் பெரியோர்களின் ஆசியாலும்",
          "திரு. ராஜேந்திரன் – திருமதி. மீனா அவர்களின் அன்புப் புதல்வன்",
          "செல்வன் அர்ஜுன்",
          "மற்றும்",
          "திரு. சுரேஷ் – திருமதி. லதா அவர்களின் அன்புப் புதல்வி",
          "செல்வி பிரியா",
          "ஆகியோருக்கு நிச்சயதார்த்தம் நடைபெற இருப்பதால்,",
          "தாங்கள் தங்கள் குடும்பத்துடன் வருகை தந்து சிறப்பிக்குமாறு அன்புடன் அழைக்கிறோம்.",
          "நாள்: ஞாயிறு, 15 நவம்பர் 2026 · காலை 10.30 – 12.00",
          "இடம்: ஸ்ரீ லக்ஷ்மி மஹால், அண்ணா நகர், சென்னை",
          "தங்கள் நல்வரவை விரும்பும்,",
          "திரு. சுரேஷ் – திருமதி. லதா குடும்பத்தினர்",
        ],
      },
      { t: "h2", text: "Formal English", id: "formal" },
      {
        t: "sample",
        lang: "en",
        title: "Engagement Ceremony",
        lines: [
          "|| Sri Ganeshaya Namah ||",
          "Mr. & Mrs. Suresh",
          "request the pleasure of your company at the engagement of their daughter",
          "Priya",
          "with",
          "Arjun",
          "son of Mr. & Mrs. Rajendran",
          "on Sunday, 15 November 2026 at 10.30 AM",
          "at Sri Lakshmi Mahal, Anna Nagar, Chennai",
          "Lunch to follow",
        ],
      },
      { t: "h2", text: "Ring ceremony — modern", id: "modern" },
      {
        t: "sample",
        lang: "en",
        title: "Ring Ceremony",
        lines: [
          "She said yes — now we'd love you to be there.",
          "Priya & Arjun",
          "invite you to their ring ceremony",
          "Saturday, 14 November 2026 · 6.30 PM onwards",
          "The Terrace, Besant Nagar, Chennai",
          "Dinner, music and a lot of happy tears",
        ],
      },
      { t: "h2", text: "Short lines for the card", id: "short" },
      {
        t: "ul",
        items: [
          "Two families, one promise — join us as Priya and Arjun get engaged.",
          "With joy in our hearts, we invite you to the engagement of our daughter Priya with Arjun.",
          "The first step to forever — Priya & Arjun's engagement.",
          "Join us to bless Priya and Arjun as they exchange rings.",
          "Our families are coming together, and we'd love you there.",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "sample",
        lang: "en",
        title: "For family",
        lines: [
          "Dear Kumar mama and family,",
          "With the blessings of elders, Priya's nichayathartham with Arjun is fixed for Sunday, 15 November at 10.30 AM, at Sri Lakshmi Mahal, Anna Nagar.",
          "Please come with family and bless them. The invitation, timings and map are here: [link]",
          "— Suresh & Latha",
        ],
      },
      {
        t: "sample",
        lang: "ta",
        title: "குடும்பத்தினருக்கு",
        lines: [
          "அன்புள்ள குமார் மாமா குடும்பத்தினருக்கு,",
          "பெரியோர்களின் ஆசியுடன் பிரியா – அர்ஜுன் நிச்சயதார்த்தம் 15 நவம்பர் ஞாயிறு காலை 10.30 மணிக்கு அண்ணா நகர் ஸ்ரீ லக்ஷ்மி மஹாலில் நடைபெறுகிறது.",
          "குடும்பத்துடன் வந்து வாழ்த்துங்கள். அழைப்பிதழ், நேரம், வழி இங்கே: [link]",
          "— சுரேஷ் & லதா",
        ],
      },
      {
        t: "sample",
        lang: "en",
        title: "For friends",
        lines: [
          "It's official! 💍",
          "Arjun and I are getting engaged on Saturday, 14 November, 6.30 PM at The Terrace, Besant Nagar.",
          "Come celebrate with us — details and map: [link]",
          "— Priya",
        ],
      },
      {
        t: "cta",
        title: "Engagement and nichayathartham designs",
        text: "A Tamil nichayathartham pathirikai, temple doors or a wax-sealed envelope — with the ring ceremony, lunch, Google Maps and RSVP. Try any design free.",
        href: "/invitations/nichayathartham-invitation",
        button: "See engagement designs",
      },
    ],
    faq: [
      {
        q: "When should engagement invitations be sent?",
        a: "Two to three weeks before is usual. Engagements are often fixed at shorter notice than weddings, so a WhatsApp invitation with a call to elders works well.",
      },
      {
        q: "Who sends the nichayathartham invitation?",
        a: "Traditionally the bride's family hosts the nichayathartham and sends the invitation, though many families now send it jointly from both sides.",
      },
      {
        q: "Can the engagement and wedding be on one invitation?",
        a: "Yes, if they are close together. A live invitation can list the nichayathartham and the muhurtham as two functions, each with its own time and map.",
      },
    ],
  },

  {
    slug: "wedding-reception-invitation-message",
    metaTitle: "Wedding Reception Invitation Message: 12 Samples",
    description:
      "Wedding reception invitation wording and messages — formal, from parents, from the couple, for colleagues and for WhatsApp, in English and Tamil.",
    ogTitle: "Reception Invitation Wording for Every Guest",
    title: "Wedding Reception Invitation Message: 12 Samples for Cards & WhatsApp",
    excerpt:
      "Reception invitation wording for the card and for WhatsApp — from the parents, from the couple, for colleagues, for a reception after a private wedding — in English and Tamil.",
    keywords: [
      "wedding reception invitation message",
      "reception invitation wording",
      "reception invitation for WhatsApp",
      "marriage reception invitation",
      "திருமண வரவேற்பு அழைப்பிதழ்",
    ],
    published: "2026-11-07",
    updated: "2026-11-07",
    readMinutes: 6,
    related: ["whatsapp-wedding-invitation-message", "tamil-wedding-invitation-wording", "wedding-hashtag-ideas"],
    body: [
      {
        t: "p",
        text: "The reception is often the biggest gathering of the wedding — colleagues, neighbours and friends who could not come to an early-morning muhurtham. Its invitation can be a little lighter than the wedding card. Here are samples for every situation, ready to copy.",
      },
      { t: "h2", text: "Formal — from the parents", id: "parents" },
      {
        t: "sample",
        lang: "en",
        title: "Wedding Reception",
        lines: [
          "Mr. & Mrs. Rajendran",
          "request the pleasure of your company with family at the reception of their son",
          "Arjun",
          "with",
          "Priya",
          "daughter of Mr. & Mrs. Suresh",
          "on Saturday, 23 January 2027, 7.00 PM onwards",
          "at Grand Convention Hall, T. Nagar, Chennai",
          "Dinner follows",
        ],
      },
      { t: "h2", text: "In Tamil", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "திருமண வரவேற்பு",
        lines: [
          "திருமண வரவேற்பு விழா",
          "எங்கள் அன்புப் புதல்வன் செல்வன் அர்ஜுன்",
          "மற்றும்",
          "செல்வி பிரியா",
          "ஆகியோரின் திருமண வரவேற்பு விழா",
          "23 ஜனவரி 2027 சனிக்கிழமை மாலை 7 மணி முதல்",
          "டி. நகர், கிராண்ட் கன்வென்ஷன் ஹாலில் நடைபெறும்.",
          "தாங்கள் தங்கள் குடும்பத்துடன் வருகை தந்து மணமக்களை வாழ்த்துமாறு அன்புடன் அழைக்கிறோம்.",
          "திரு. ராஜேந்திரன் – திருமதி. மீனா",
        ],
      },
      { t: "h2", text: "From the couple", id: "couple" },
      {
        t: "sample",
        lang: "en",
        title: "Reception",
        lines: [
          "We're married! Now let's celebrate.",
          "Priya & Arjun",
          "invite you to our wedding reception",
          "Saturday, 23 January 2027 · 7 PM onwards",
          "Grand Convention Hall, T. Nagar, Chennai",
          "Dinner, music and dancing",
        ],
      },
      { t: "h2", text: "Reception after a private or destination wedding", id: "after" },
      {
        t: "sample",
        lang: "en",
        title: "Celebration",
        lines: [
          "We tied the knot in a small temple ceremony with our families,",
          "and now we'd love to celebrate with you.",
          "Priya & Arjun",
          "Reception · Sunday, 7 February 2027, 7 PM",
          "The Residency, Coimbatore",
        ],
      },
      { t: "h2", text: "Short lines for the card", id: "short" },
      {
        t: "ul",
        items: [
          "Join us for an evening of food, music and blessings as we celebrate Priya and Arjun.",
          "The wedding was the promise — the reception is the party. Do come!",
          "Your blessings made the wedding; your presence will make the reception.",
          "Come raise a toast (of filter coffee) to the newly-weds.",
          "Dinner, dancing and the two of us — see you there.",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "sample",
        lang: "en",
        title: "For relatives",
        lines: [
          "Dear Lakshmi athai and family,",
          "Arjun and Priya's reception is on Saturday, 23 January at 7 PM, at Grand Convention Hall, T. Nagar.",
          "Please come with family and bless them. Timings and map: [link]",
          "— Rajendran & Meena",
        ],
      },
      {
        t: "sample",
        lang: "en",
        title: "For colleagues",
        lines: [
          "Hi team,",
          "I'm getting married on 24 January and would love for you to join us at the reception on Saturday, 23 January, 7 PM at Grand Convention Hall, T. Nagar.",
          "Details and directions: [link]",
          "— Arjun",
        ],
      },
      {
        t: "sample",
        lang: "ta",
        title: "நண்பர்களுக்கு",
        lines: [
          "அன்பு நண்பர்களே,",
          "எங்கள் திருமண வரவேற்பு 23 ஜனவரி சனிக்கிழமை மாலை 7 மணிக்கு டி. நகர் கிராண்ட் கன்வென்ஷன் ஹாலில்.",
          "கண்டிப்பாக வாருங்கள்! விவரம், வழி இங்கே: [link]",
          "— அர்ஜுன் & பிரியா",
        ],
      },
      {
        t: "tip",
        text: "If the reception is the evening before the muhurtham, as is common in Tamil Nadu, put both functions in one invitation so guests coming to only one know which to attend.",
      },
      {
        t: "cta",
        title: "One link for the reception and the wedding",
        text: "Add the reception and the muhurtham as two functions, each with its own time and Google Maps link — with RSVP so you can plan the dinner count.",
        href: "/invitations/wedding",
        button: "See wedding designs",
      },
    ],
    faq: [
      {
        q: "How do you word a reception-only invitation?",
        a: "Name the hosts (parents or the couple), the couple, the date, time and venue, and mention that dinner follows. If the wedding was private, a line like \"we tied the knot with our families and would love to celebrate with you\" explains it warmly.",
      },
      {
        q: "When should reception invitations be sent?",
        a: "With the wedding invitations, four to six weeks before. Send a reminder a day or two before the reception.",
      },
      {
        q: "Can I invite colleagues only to the reception?",
        a: "Yes — it is very common. Send them the reception invitation alone so they know which function they are invited to.",
      },
    ],
  },

  {
    slug: "griha-pravesam-invitation-wording-tamil",
    metaTitle: "Griha Pravesam Invitation Wording in Tamil & English",
    description:
      "Griha pravesam (புதுமனை புகுவிழா) invitation wording in Tamil and English, with WhatsApp messages and what to include — homam time, lunch, address.",
    ogTitle: "புதுமனை புகுவிழா Invitation Wording You Can Copy",
    title: "Griha Pravesam Invitation Wording in Tamil & English (புதுமனை புகுவிழா)",
    excerpt:
      "Copy-ready griha pravesam invitation wording — a traditional Tamil புதுமனை புகுவிழா card, English wording, and WhatsApp messages for family, neighbours and colleagues.",
    keywords: [
      "griha pravesam invitation",
      "housewarming invitation Tamil",
      "புதுமனை புகுவிழா அழைப்பிதழ்",
      "grihapravesam invitation wording",
      "housewarming invitation message",
    ],
    published: "2026-11-07",
    updated: "2026-11-07",
    readMinutes: 5,
    related: ["tamil-wedding-invitation-wording", "whatsapp-wedding-invitation-message", "engagement-invitation-wording"],
    body: [
      {
        t: "p",
        text: "Griha pravesam — புதுமனை புகுவிழா or கிரகப்பிரவேசம் — is the first entry into a new home, usually early in the morning with a Ganapathi homam, the boiling of milk and a lunch for family and friends. Here is the traditional Tamil wording, an English version, and short messages for WhatsApp.",
      },
      { t: "h2", text: "What to include", id: "include" },
      {
        t: "ol",
        items: [
          "Invocation — உ, ஸ்ரீ விநாயகர் துணை or the family deity.",
          "Title — புதுமனை புகுவிழா அழைப்பிதழ் or கிரகப்பிரவேச அழைப்பிதழ்.",
          "The date, day and the auspicious time (நல்ல நேரம்) for the homam and entry — fixed with your family priest.",
          "The full address of the new home with a landmark, and a map link.",
          "Lunch or breakfast timing.",
          "The hosts' names.",
        ],
      },
      { t: "h2", text: "Traditional Tamil wording", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "புதுமனை புகுவிழா அழைப்பிதழ்",
        lines: [
          "உ",
          "ஸ்ரீ விநாயகர் துணை",
          "புதுமனை புகுவிழா அழைப்பிதழ்",
          "நிகழும் மங்களகரமான நன்னாளில், இறையருளால்",
          "12 பிப்ரவரி 2027 வெள்ளிக்கிழமை காலை 6.00 – 7.30 மணிக்குள்",
          "எங்கள் புதிய இல்லத்தில் கணபதி ஹோமம் மற்றும் கிரகப்பிரவேசம் நடைபெற உள்ளது.",
          "அதுசமயம் தாங்கள் தங்கள் குடும்பத்துடன் வருகை தந்து விழாவைச் சிறப்பிக்குமாறு அன்புடன் அழைக்கிறோம்.",
          "இடம்: \"ஸ்ரீ நிலையம்\", எண் 12, 3வது தெரு, வேளச்சேரி, சென்னை",
          "மதிய விருந்து: 12.00 மணி",
          "தங்கள் நல்வரவை விரும்பும்,",
          "திரு. ராஜேந்திரன் – திருமதி. மீனா குடும்பத்தினர்",
        ],
      },
      { t: "h2", text: "English wording", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Griha Pravesam",
        lines: [
          "|| Sri Ganeshaya Namah ||",
          "With the blessings of the Almighty and our elders,",
          "we invite you and your family to the Griha Pravesam of our new home",
          "\"Sri Nilayam\"",
          "on Friday, 12 February 2027",
          "Ganapathi Homam: 6.00 – 7.30 AM",
          "Lunch: 12.00 noon",
          "No. 12, 3rd Street, Velachery, Chennai",
          "Rajendran & Meena",
        ],
      },
      { t: "h2", text: "Modern housewarming", id: "modern" },
      {
        t: "sample",
        lang: "en",
        title: "Housewarming",
        lines: [
          "New keys, new door, same us.",
          "Come see our new home!",
          "Housewarming · Sunday, 14 February 2027 · 11 AM – 3 PM",
          "Flat 4B, Green Acres, OMR, Chennai",
          "Lunch is on us",
          "— Arjun & Priya",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "sample",
        lang: "ta",
        title: "உறவினர்களுக்கு",
        lines: [
          "அன்புள்ள குமார் மாமா குடும்பத்தினருக்கு,",
          "இறையருளால் எங்கள் புதுமனை புகுவிழா 12 பிப்ரவரி வெள்ளிக்கிழமை காலை 6 மணிக்கு வேளச்சேரியில் நடைபெறுகிறது.",
          "குடும்பத்துடன் வந்து ஆசீர்வதியுங்கள். முகவரி, வழி இங்கே: [link]",
          "— ராஜேந்திரன் & மீனா",
        ],
      },
      {
        t: "sample",
        lang: "en",
        title: "For friends and colleagues",
        lines: [
          "Hi all,",
          "We've moved into our new home, and the griha pravesam is on Friday, 12 February. The homam is early (6 AM), so do come for lunch at 12!",
          "Address and map: [link]",
          "— Rajendran & Meena",
        ],
      },
      {
        t: "tip",
        text: "The homam is usually at dawn, so tell guests clearly which part to come for. Close family come for the homam; most friends and colleagues come for lunch.",
      },
      {
        t: "cta",
        title: "Griha pravesam invitation designs",
        text: "A Tamil griha pravesam pathirikai, a kuthuvilakku lamp or a cinematic housewarming film — with the homam time, lunch, Google Maps and RSVP. Try any design free.",
        href: "/invitations/griha-pravesam-invitation",
        button: "See griha pravesam designs",
      },
      { t: "h2", text: "Tips for a smooth day", id: "tips" },
      {
        t: "ul",
        items: [
          "Give a landmark — new buildings are rarely on Google Maps yet. A pin dropped at the gate helps most.",
          "Mention parking, especially in apartments.",
          "Say whether lunch is at home or at a nearby hall.",
          "Fix the date and nalla neram with your family priest before printing or sending anything.",
        ],
      },
    ],
    faq: [
      {
        q: "What is griha pravesam called in Tamil?",
        a: "புதுமனை புகுவிழா (pudhumanai pugu vizha) or கிரகப்பிரவேசம் (kirahappiravesam).",
      },
      {
        q: "When should griha pravesam invitations be sent?",
        a: "Two to three weeks before. Since the homam is early in the morning, send a reminder the evening before with the exact time and a map pin.",
      },
      {
        q: "Can I invite people on WhatsApp for a housewarming?",
        a: "Yes, that is now the usual way. Call elders and close family as well, and share one link with the time, the address and directions.",
      },
    ],
  }
];

export function getPost(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug);
}
