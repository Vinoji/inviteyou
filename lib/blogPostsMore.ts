import type { Post } from "./blog";

/**
 * Guides added in November 2026 (appended to POSTS in lib/blog.ts): the
 * searches behind the newer designs — valaikappu wording, the WhatsApp
 * video invitation, nikah and church wedding wording, and the naming
 * ceremonies.
 */
export const MORE_POSTS: Post[] = [
  {
    slug: "valaikappu-invitation-wording",
    metaTitle: "Valaikappu Invitation Wording in Tamil & English",
    description:
      "Valaikappu (வளைகாப்பு) and seemantham invitation wording in Tamil and English, with WhatsApp messages and what to include — date, time, venue, family.",
    ogTitle: "வளைகாப்பு Invitation Wording You Can Copy",
    title: "Valaikappu Invitation Wording in Tamil & English (வளைகாப்பு அழைப்பிதழ்)",
    excerpt:
      "Copy-ready valaikappu and seemantham invitation wording — a traditional Tamil card, an English version, and short WhatsApp messages for family and friends.",
    keywords: [
      "valaikappu invitation",
      "valaikappu invitation wording in Tamil",
      "வளைகாப்பு அழைப்பிதழ்",
      "seemantham invitation",
      "baby shower invitation Tamil",
    ],
    published: "2026-11-17",
    updated: "2026-11-17",
    readMinutes: 5,
    related: ["tamil-wedding-invitation-wording", "griha-pravesam-invitation-wording-tamil", "whatsapp-wedding-invitation-message"],
    body: [
      {
        t: "p",
        text: "Valaikappu — வளைகாப்பு, also called seemantham — blesses the mother-to-be in the seventh or ninth month: elders slip glass bangles on her wrists, apply sandal and kumkum, and pray for a safe delivery. The invitation is usually sent by her parents or in-laws. Here is what to include, the traditional Tamil wording, an English version and short WhatsApp messages.",
      },
      { t: "h2", text: "What to include", id: "include" },
      {
        t: "ol",
        items: [
          "Invocation — உ, ஸ்ரீ விநாயகர் துணை, or your family deity.",
          "Title — வளைகாப்பு விழா அழைப்பிதழ் (or சீமந்தம்).",
          "The mother-to-be's name with சௌபாக்கியவதி, and her husband's name.",
          "The date, day and the auspicious time (நல்ல நேரம்) your family has fixed.",
          "The venue with its full address and a map link.",
          "Lunch timing, if guests are staying for the meal.",
          "The hosting family's names.",
        ],
      },
      { t: "h2", text: "Traditional Tamil wording", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "வளைகாப்பு விழா அழைப்பிதழ்",
        lines: [
          "உ",
          "ஸ்ரீ விநாயகர் துணை",
          "வளைகாப்பு விழா அழைப்பிதழ்",
          "நிகழும் மங்களகரமான நன்னாளில், இறையருளாலும் பெரியோர்களின் ஆசியாலும்",
          "எங்கள் இல்லத்துச் செல்வி சௌபாக்கியவதி பிரியா (திரு. அர்ஜுன் அவர்களின் அன்புத் துணைவியார்)",
          "அவர்களுக்கு 20 டிசம்பர் 2026 ஞாயிற்றுக்கிழமை காலை 10.30 மணிக்கு",
          "வளைகாப்பு வைபவம் நடைபெற உள்ளது.",
          "அதுசமயம் தாங்கள் தங்கள் குடும்பத்துடன் வருகை தந்து, தாயையும் சேயையும் வாழ்த்துமாறு அன்புடன் அழைக்கிறோம்.",
          "இடம்: ஸ்ரீ அன்னபூர்ணா அரங்கம், திருச்சி",
          "தங்கள் நல்வரவை இனிதே எதிர்நோக்கும், சுரேஷ் – லக்ஷ்மி குடும்பத்தினர்",
        ],
      },
      { t: "tip", text: "Avoid சடங்கு on an invitation — many families read it as funeral rites. Use வைபவம் or விழா instead." },
      { t: "h2", text: "English wording", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Valaikappu invitation",
        lines: [
          "With the blessings of Lord Ganesha",
          "We joyfully invite you to the Valaikappu of",
          "Sowbhagyavathi Priya (wife of Mr. Arjun)",
          "on Sunday, 20 December 2026, at 10:30 AM",
          "at Sri Annapoorna Hall, Tiruchirappalli.",
          "Come, bless the mother and the little one on the way.",
          "With love, the family of Suresh & Lakshmi",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "ul",
        items: [
          "வணக்கம்! எங்கள் வீட்டுச் செல்வி பிரியாவின் வளைகாப்பு 20 டிசம்பர், ஞாயிறு காலை 10.30 மணிக்கு. குடும்பத்துடன் வந்து வாழ்த்துங்கள் 🙏 அழைப்பிதழ், வழி: [link]",
          "We're celebrating Priya's valaikappu on Sunday, 20 December, 10:30 AM. Please come and bless her — invitation and directions: [link]",
        ],
      },
      {
        t: "cta",
        title: "Make your valaikappu invitation",
        text: "Designs with bangle ceremonies, baby Krishna, Murugan and the Kerala noolukettu — in Tamil or English. Try any design free.",
        href: "/invitations/valaikappu-invitation",
        button: "See valaikappu designs",
      },
    ],
    faq: [
      {
        q: "Who sends the valaikappu invitation?",
        a: "Traditionally the mother-to-be's parents or her in-laws, depending on whose home hosts the ceremony. The hosting family's names go at the end of the card.",
      },
      {
        q: "Is valaikappu the same as seemantham?",
        a: "They are celebrated together in many families: valaikappu is the bangle ceremony, seemantham the prayer for the mother and child. One invitation usually covers both.",
      },
      {
        q: "Which month is valaikappu held?",
        a: "Usually in the seventh or ninth month of pregnancy, on a day the family fixes with their priest or elders.",
      },
    ],
  },
  {
    slug: "wedding-invitation-video-whatsapp",
    metaTitle: "Wedding Invitation Video for WhatsApp: How to Make One",
    description:
      "How to make a wedding invitation video for WhatsApp — length, size, music and wording — and how to turn your invitation into a video in minutes.",
    title: "Wedding Invitation Video for WhatsApp: How to Make One That Gets Watched",
    excerpt:
      "What makes a WhatsApp invitation video work — the right length and size, music, what to show — and the quickest way to make one from your invitation.",
    keywords: [
      "wedding invitation video",
      "WhatsApp invitation video",
      "video invitation for wedding",
      "invitation video maker",
      "Tamil wedding invitation video",
    ],
    published: "2026-11-17",
    updated: "2026-11-17",
    readMinutes: 4,
    related: ["whatsapp-wedding-invitation-message", "digital-wedding-invitation-india", "tamil-wedding-invitation-wording"],
    body: [
      {
        t: "p",
        text: "In most Indian families the invitation that actually travels is a video: forwarded to every family group, watched on the spot, saved to the gallery. A good invitation video is short, vertical, readable without sound and still lovely with it. Here is what to get right, and the quickest way to make one.",
      },
      { t: "h2", text: "What a good invitation video gets right", id: "right" },
      {
        t: "ul",
        items: [
          "Vertical (9:16), so it fills the phone screen.",
          "20–40 seconds. Long enough for the names, the date, the venue and the families; short enough that it's watched to the end.",
          "Text that stays on screen long enough to read — guests often watch with the sound off.",
          "Music that suits the occasion: nadaswaram or veena for a Tamil wedding, chenda for Kerala, soft instrumental for a church wedding.",
          "A closing frame with the names, the date and where to find directions.",
          "Under 16 MB, so it forwards quickly even on a slow connection.",
        ],
      },
      { t: "h2", text: "What to show, in order", id: "order" },
      {
        t: "ol",
        items: [
          "The blessing — உ, the family deity, or a verse.",
          "The couple's names.",
          "The muhurtham: date, day and time.",
          "The venue, with the area so guests know where it is.",
          "The families' welcome.",
          "Other functions — reception, mehendi — with their times.",
        ],
      },
      { t: "h2", text: "Video and link together", id: "both" },
      {
        t: "p",
        text: "A video is what people forward; a link is what they use on the day — the map, the add-to-calendar, the RSVP. Send both: the video to the family groups, the link with it for directions.",
      },
      {
        t: "cta",
        title: "Turn your invitation into a video",
        text: "Make your invitation, go live from ₹{price}, then get it as a WhatsApp video — its opening, every screen and your music — for ₹99.",
        href: "/invitations/wedding",
        button: "See wedding designs",
      },
      { t: "tip", text: "Post the video in the family group first, then send the link in the same message — guests can watch, then tap for directions." },
    ],
    faq: [
      {
        q: "How long should a wedding invitation video be?",
        a: "20 to 40 seconds suits WhatsApp: long enough for the names, date, venue and families, short enough to be watched to the end.",
      },
      {
        q: "Can I get my InviteForYou invitation as a video?",
        a: "Yes. Once your invitation is live, the WhatsApp video is a ₹99 add-on: your invitation's opening and every screen, with your music and an end card, as a vertical MP4 ready in a few minutes.",
      },
      {
        q: "Should I send a video or a link?",
        a: "Both. The video is what gets forwarded and watched; the link carries the map, the calendar reminder and the RSVP.",
      },
    ],
  },
  {
    slug: "nikah-invitation-wording",
    metaTitle: "Nikah Invitation Wording in English & Tamil",
    description:
      "Nikah invitation wording in English and Tamil — Bismillah, the couple, the families, nikah and walima times — with WhatsApp messages and Kerala Muslim wording.",
    title: "Nikah Invitation Wording in English & Tamil (with Walima)",
    excerpt:
      "Copy-ready nikah invitation wording — from Bismillah to the walima — in English and Tamil, with WhatsApp messages and notes for Kerala and Malabar weddings.",
    keywords: [
      "nikah invitation wording",
      "Muslim wedding invitation wording",
      "nikah invitation in Tamil",
      "walima invitation",
      "Kerala Muslim wedding invitation",
    ],
    published: "2026-11-17",
    updated: "2026-11-17",
    readMinutes: 5,
    related: ["wedding-invitation-wording-all-religions", "kerala-wedding-invitation-wording", "whatsapp-wedding-invitation-message"],
    body: [
      {
        t: "p",
        text: "A nikah invitation opens with the Bismillah, names the couple with their parents, and gives the times for the nikah and the walima. In Kerala and the Malabar coast, the mylanchi (henna) night and the wedding lunch are often on the same card. Here is the wording in English and Tamil.",
      },
      { t: "h2", text: "What to include", id: "include" },
      {
        t: "ol",
        items: [
          "Bismillahir Rahmanir Raheem — in Arabic, or written out.",
          "The bride and groom, each with their parents (son of / daughter of).",
          "The nikah: date, time and venue (the masjid or the hall).",
          "The walima, and the mylanchi night if you are having one.",
          "A line asking for the guests' duas.",
          "The hosting families' names.",
        ],
      },
      { t: "h2", text: "English wording", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Nikah invitation",
        lines: [
          "Bismillahir Rahmanir Raheem",
          "With the blessings of Allah and our elders,",
          "Mr. & Mrs. Abdul Rahman",
          "request the honour of your presence at the Nikah of their son",
          "Muhammed Shafi",
          "with Fathima Nasrin, daughter of Mr. & Mrs. Moideen Kutty,",
          "on Sunday, 10 January 2027, at 11:00 AM, at Al-Ameen Auditorium, Kozhikode.",
          "Walima to follow at 12:30 PM. Your presence and duas will honour us.",
        ],
      },
      { t: "h2", text: "Tamil wording", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "நிக்காஹ் அழைப்பிதழ்",
        lines: [
          "பிஸ்மில்லாஹிர் ரஹ்மானிர் ரஹீம்",
          "அளவற்ற அருளாளனும் நிகரற்ற அன்புடையோனுமாகிய அல்லாஹ்வின் திருப்பெயரால்,",
          "திரு. & திருமதி. அப்துல் ரஹ்மான் அவர்களின் அன்பு மகன் முஹம்மது ஷாஃபி",
          "அவர்களுக்கும், திரு. & திருமதி. மொய்தீன் குட்டி அவர்களின் அன்பு மகள் ஃபாத்திமா நஸ்ரின்",
          "அவர்களுக்கும் 10 ஜனவரி 2027 ஞாயிற்றுக்கிழமை காலை 11.00 மணிக்கு நிக்காஹ் நடைபெற உள்ளது.",
          "தாங்கள் குடும்பத்துடன் வருகை தந்து துஆ செய்யுமாறு அன்புடன் அழைக்கிறோம்.",
          "வலீமா விருந்து: மதியம் 12.30 மணி",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "ul",
        items: [
          "Assalamu alaikum! Shafi and Nasrin's nikah is on Sunday, 10 January, 11 AM, at Al-Ameen Auditorium, with walima after. Please join us and keep them in your duas 🤲 Invitation & directions: [link]",
          "அஸ்ஸலாமு அலைக்கும்! ஷாஃபி – நஸ்ரின் நிக்காஹ் ஜனவரி 10, ஞாயிறு காலை 11 மணிக்கு. குடும்பத்துடன் வந்து துஆ செய்யுங்கள் 🤲 அழைப்பிதழ், வழி: [link]",
        ],
      },
      {
        t: "cta",
        title: "Make your nikah invitation",
        text: "Designs with jaali and velvet, emerald and gold, and a Malabar mylanchi card with oppana — in English or Tamil.",
        href: "/invitations/nikah-invitation",
        button: "See nikah designs",
      },
    ],
    faq: [
      {
        q: "Who is named first on a nikah invitation?",
        a: "Usually the hosting family — most often the groom's parents name their son first, then the bride with her parents. Follow your family's custom.",
      },
      {
        q: "Can the walima be on the same invitation?",
        a: "Yes. Give it its own line with the time and venue, or add it as a second function so guests can get directions to each.",
      },
      {
        q: "Should I write the Bismillah in Arabic?",
        a: "Either is fine. Many families print it in Arabic script; on a digital invitation the written-out Bismillahir Rahmanir Raheem reads well on every phone.",
      },
    ],
  },
  {
    slug: "christian-wedding-invitation-wording",
    metaTitle: "Christian Wedding Invitation Wording (English & Tamil)",
    description:
      "Christian wedding invitation wording in English and Tamil — holy matrimony, the church, the reception — with Bible verses and Kerala minnu kettu wording.",
    title: "Christian Wedding Invitation Wording in English & Tamil",
    excerpt:
      "Copy-ready Christian wedding invitation wording — holy matrimony and reception, Bible verses that suit the card, and Tamil and Kerala minnu kettu versions.",
    keywords: [
      "Christian wedding invitation wording",
      "church wedding invitation",
      "holy matrimony invitation",
      "Christian wedding invitation Tamil",
      "minnu kettu invitation",
    ],
    published: "2026-11-17",
    updated: "2026-11-17",
    readMinutes: 5,
    related: ["wedding-invitation-wording-all-religions", "kerala-wedding-invitation-wording", "wedding-reception-invitation-message"],
    body: [
      {
        t: "p",
        text: "A Christian wedding invitation usually opens with God's grace or a verse, invites guests to the holy matrimony at the church, and then to the reception. In Kerala, the minnu kettu — tying the minnu — is the heart of the ceremony. Here is the wording in English and Tamil.",
      },
      { t: "h2", text: "Verses that suit an invitation", id: "verses" },
      {
        t: "ul",
        items: [
          "“Love is patient, love is kind.” — 1 Corinthians 13:4",
          "“A cord of three strands is not quickly broken.” — Ecclesiastes 4:12",
          "“What God has joined together, let no one separate.” — Mark 10:9",
        ],
      },
      { t: "h2", text: "English wording", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Holy Matrimony",
        lines: [
          "By the grace of God,",
          "Mr. & Mrs. George Varghese and Mr. & Mrs. Thomas Mathew",
          "joyfully invite you to the holy matrimony of their children",
          "Joseph & Anna",
          "on Saturday, 19 December 2026, at 10:30 AM",
          "at St. Mary's Cathedral Basilica, Ernakulam,",
          "and to the reception that evening at 6:30 PM.",
        ],
      },
      { t: "h2", text: "Tamil wording", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "திருமண அழைப்பிதழ்",
        lines: [
          "இறைவனின் திருவருளால்",
          "திரு. & திருமதி. ஜார்ஜ் வர்கீஸ் அவர்களின் அன்பு மகன் ஜோசப்",
          "அவர்களுக்கும், திரு. & திருமதி. தாமஸ் மேத்யூ அவர்களின் அன்பு மகள் அன்னா",
          "அவர்களுக்கும் 19 டிசம்பர் 2026 சனிக்கிழமை காலை 10.30 மணிக்கு",
          "புனித மரியாள் பேராலயத்தில் திருமணத் திருப்பலி நடைபெற உள்ளது.",
          "தாங்கள் குடும்பத்துடன் வருகை தந்து, எங்களுடன் ஜெபித்து மணமக்களை வாழ்த்துமாறு அன்புடன் அழைக்கிறோம்.",
        ],
      },
      {
        t: "tip",
        text: "Catholic cards usually say திருமணத் திருப்பலி (nuptial mass); many Protestant churches say திருமண ஆராதனை. Use the one your church does.",
      },
      {
        t: "cta",
        title: "Make your church wedding invitation",
        text: "Designs with a white Kerala church, doves and lilies, stained glass and chapel bells — in English or Tamil.",
        href: "/invitations/christian-wedding-invitation",
        button: "See Christian designs",
      },
    ],
    faq: [
      {
        q: "What is minnu kettu?",
        a: "In Kerala Christian weddings the groom ties the minnu — a small gold pendant, often heart-shaped with a cross — on the bride's neck during the ceremony. Many Kerala cards name the occasion simply as the minnu kettu.",
      },
      {
        q: "Should the reception be on the same invitation?",
        a: "Yes, when most guests are invited to both. Give it its own time and venue so guests can get directions to each.",
      },
      {
        q: "Which verse should I use?",
        a: "Any short verse about love or marriage works. 1 Corinthians 13:4 and Ecclesiastes 4:12 are the most common on Indian Christian cards.",
      },
    ],
  },
  {
    slug: "naming-ceremony-invitation-wording",
    metaTitle: "Naming Ceremony Invitation Wording: Tamil & Kerala",
    description:
      "Naming ceremony invitation wording — namakaranam, Kerala noolukettu and choroonu — in Tamil and English, with WhatsApp messages.",
    title: "Naming Ceremony Invitation Wording: Namakaranam, Noolukettu & Choroonu",
    excerpt:
      "Copy-ready invitation wording for a baby's naming ceremony — Tamil namakaranam (பெயர் சூட்டு விழா), Kerala noolukettu and choroonu — with WhatsApp messages.",
    keywords: [
      "naming ceremony invitation",
      "namakaranam invitation wording",
      "பெயர் சூட்டு விழா அழைப்பிதழ்",
      "noolukettu invitation",
      "choroonu invitation",
    ],
    published: "2026-11-17",
    updated: "2026-11-17",
    readMinutes: 4,
    related: ["valaikappu-invitation-wording", "tamil-wedding-invitation-wording", "griha-pravesam-invitation-wording-tamil"],
    body: [
      {
        t: "p",
        text: "A baby's first ceremonies bring the whole family together. In Tamil homes the naming — பெயர் சூட்டு விழா or namakaranam — is often on the 11th or 16th day; in Kerala the noolukettu falls on the 28th day, when a gold or black thread (the aranjanam) is tied and the name whispered in the baby's ear; and the choroonu, the first rice, follows months later, often at Guruvayur.",
      },
      { t: "h2", text: "What to include", id: "include" },
      {
        t: "ol",
        items: [
          "Invocation — your family deity, Sree Guruvayurappan or உ.",
          "The occasion — பெயர் சூட்டு விழா, noolukettu or choroonu.",
          "The baby as 'baby of' the parents — the name is often kept for the day itself.",
          "Date, day and time, the venue and its address.",
          "Lunch or sadya timing.",
          "The hosting family.",
        ],
      },
      { t: "h2", text: "Tamil wording — பெயர் சூட்டு விழா", id: "tamil" },
      {
        t: "sample",
        lang: "ta",
        title: "பெயர் சூட்டு விழா அழைப்பிதழ்",
        lines: [
          "உ",
          "ஸ்ரீ விநாயகர் துணை",
          "இறையருளால் எங்கள் இல்லத்தை ஒளிரச் செய்த",
          "காவ்யா – அருண் தம்பதியரின் செல்லக் குழந்தைக்கு",
          "6 டிசம்பர் 2026 ஞாயிற்றுக்கிழமை காலை 10.00 மணிக்கு பெயர் சூட்டு விழா நடைபெற உள்ளது.",
          "தாங்கள் குடும்பத்துடன் வருகை தந்து குழந்தையை ஆசீர்வதிக்குமாறு அன்புடன் அழைக்கிறோம்.",
          "இடம்: ஸ்ரீ விநாயகர் கோவில் அரங்கம், ஆர்.எஸ். புரம், கோயம்புத்தூர்",
        ],
      },
      { t: "h2", text: "English wording — noolukettu or choroonu", id: "english" },
      {
        t: "sample",
        lang: "en",
        title: "Choroonu",
        lines: [
          "With Sree Guruvayurappan's blessings,",
          "our little one is ready for a first taste of rice.",
          "We invite you and your family to the choroonu of",
          "Baby of Kavya & Arun",
          "on Sunday, 6 December 2026, at 10:00 AM,",
          "and to share the sadya with us.",
        ],
      },
      { t: "h2", text: "WhatsApp messages", id: "whatsapp" },
      {
        t: "ul",
        items: [
          "எங்கள் குட்டிச் செல்லத்துக்குப் பெயர் சூட்டு விழா — டிசம்பர் 6, ஞாயிறு காலை 10 மணி. குடும்பத்துடன் வந்து ஆசீர்வதியுங்கள் 💛 அழைப்பிதழ்: [link]",
          "Our little one's noolukettu is on Sunday, 6 December, 10 AM. Please come and bless the baby — invitation & directions: [link]",
        ],
      },
      {
        t: "cta",
        title: "Make your naming ceremony invitation",
        text: "Designs with the thottil and aranjanam, baby Krishna on the banyan leaf, and temple elephants for the choroonu.",
        href: "/invitations/baby",
        button: "See baby ceremony designs",
      },
    ],
    faq: [
      {
        q: "Should the baby's name be on the invitation?",
        a: "Usually not — the name is revealed at the ceremony, so the card says 'baby of' the parents. If the name is already announced, you can add it.",
      },
      {
        q: "When is the Kerala noolukettu held?",
        a: "Traditionally on the 28th day after birth (the irupathiyettu), when the aranjanam is tied and the name whispered in the baby's ear.",
      },
      {
        q: "What is choroonu?",
        a: "The baby's first rice, usually between the sixth and eighth month, often performed at Guruvayur temple and followed by a sadya for the family.",
      },
    ],
  },
];
