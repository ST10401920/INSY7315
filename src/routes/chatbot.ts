import express, { Request, Response } from "express";
const stringSimilarity = require("string-similarity");

const router = express.Router();

interface ChatIntent {
  keywords: string[];
  replies: {
    en: string;
    af: string;
    zu: string;
  };
}

// Full intents with replies
const intents: ChatIntent[] = [
  {
    keywords: ["hello", "hi", "hey", "hallo", "haai", "sawubona", "sanibonani"],
    replies: { en: "Hi there! How can I help you today?", af: "Hallo daar! Hoe kan ek jou vandag help?", zu: "Sawubona! Ngingakusiza kanjani namhlanje?" }
  },
  {
    keywords: ["how are you", "how's it going", "hoe gaan dit", "hoe gaan dit met jou", "unjani", "unjani namhlanje"],
    replies: { en: "I'm just a bot, but I'm doing great!", af: "Ek is net 'n bot, maar ek gaan goed!", zu: "Ngiyinhlelo ye-AI, kodwa ngiyaphila kahle!" }
  },
  {
    keywords: ["bye", "goodbye", "see you", "totsiens", "sien jou later", "hamba kahle", "sizobonana"],
    replies: { en: "Goodbye! Have a nice day!", af: "Totsiens! Lekker dag verder!", zu: "Hamba kahle! Ube nosuku oluhle!" }
  },
  {
    keywords: ["help", "support", "hulp", "ondersteuning", "usizo", "ukwesekwa"],
    replies: { en: "Sure! What do you need help with?", af: "Natuurlik! Waarmee kan ek help?", zu: "Impela! Ngisize ngani namhlanje?" }
  },
  {
    keywords: ["contact support", "reach support", "helpdesk", "kontak ondersteuning", "xhumana nosizo"],
    replies: { en: "You can contact support by clicking 'Help Center' in Settings or sending an email to support@nestify.com.", af: "Jy kan ondersteuning kontak deur op 'Help Center' in Instellings te klik of 'n e-pos te stuur na support@nestify.com.", zu: "Ungathinta ukwesekwa ngokuchofoza 'Help Center' noma uthumele i-imeyili ku support@nestify.com." }
  },
  {
    keywords: ["faq", "questions", "how does this work", "veelgestelde vrae", "vrae", "hoe werk dit", "imibuzo evame ukubuzwa", "izindaba"],
    replies: { en: "You can visit the FAQ section in Settings to find answers to common questions about renting, payments, and maintenance.", af: "Besoek asseblief die FAQ-afdeling in Instellings vir antwoorde oor huur, betalings en instandhouding.", zu: "Ungavakashela isigaba se-FAQ ukuze uthole izimpendulo mayelana nokuqasha nokukhokha." }
  },
  {
    keywords: ["rent", "property", "apartment", "huur", "eiendom", "woonstel", "irenti", "impahla", "indlu"],
    replies: { en: "I can help you with property info and rentals.", af: "Ek kan jou help met eiendomsinligting en verhuring.", zu: "Ngiyakwazi ukukusiza ngolwazi lwezindawo eziqashisayo." }
  },
  {
    keywords: ["send application", "submit application", "apply for property", "apply for rent", "stuur aansoek", "doen aansoek", "thumela isicelo", "faka isicelo", "cela irenti"],
    replies: { en: "To submit an application, go to the property page and click 'Rent'. Fill out your details and upload necessary documents.", af: "Om aansoek te doen, gaan na die eiendombladsy en klik op 'Huur'. Vul jou besonderhede in en laai die nodige dokumente op.", zu: "Ukuze ufake isicelo, iya ekhasini lempahla bese uchofoza 'Rent'." }
  },
  {
    keywords: ["application status", "check application", "view application", "application update", "aansoek status", "kontroleer aansoek", "isimo sesicelo", "bheka isicelo"],
    replies: { en: "You can view your application status under 'Application History' in Settings.", af: "Jy kan jou aansoekstatus sien onder 'Aansoekgeskiedenis' in Instellings.", zu: "Ungabheka isimo sesicelo sakho ngaphansi kwe-'Application History'." }
  },
  {
    keywords: ["view lease", "lease details", "my lease", "rental agreement", "sien huurkontrak", "huur besonderhede", "buka inkontileka", "imininingwane yokuqasha"],
    replies: { en: "You can view your current lease by going to Settings, navigating to Application History and clicking 'View Lease'. Alternatively, from your dashboard click 'View Lease'.", af: "Jy kan jou huidige huurkontrak sien deur na Instellings te gaan en 'View Lease' te kies.", zu: "Ungabuka inkontileka yakho yokurenta ngaphansi kwe-'View Lease'." }
  },
  {
    keywords: ["end lease", "cancel lease", "terminate lease", "beëindig huurkontrak", "kanselleer huurkontrak", "qeda inkontileka", "khansela inkontileka"],
    replies: { en: "To request a lease termination, please contact support or reach out to your property manager through the app.", af: "Om jou huurkontrak te beëindig, kontak asseblief ondersteuning of jou eiendomsbestuurder.", zu: "Ukuze uqedele inkontileka, sicela uthinte umphathi wakho wezakhiwo." }
  },
  {
    keywords: ["update profile", "edit profile", "change details", "update info", "werk profiel op", "wysig profiel", "vuselela iphrofayela", "hlela iphrofayela"],
    replies: { en: "To update your profile, go to Settings and click 'Edit Profile'.", af: "Om jou profiel by te werk, gaan na Instellings en klik op 'Wysig Profiel'.", zu: "Ukuvuselela iphrofayela yakho, iya ku-'Settings' bese uchofoza 'Edit Profile'." }
  },
  {
    keywords: ["change password", "reset password", "forgot password", "verander wagwoord", "stel wagwoord terug", "shintsha iphasiwedi", "setha kabusha iphasiwedi"],
    replies: { en: "To reset your password, click 'Forgot Password' on the login screen or go to Settings > Account Security.", af: "Om jou wagwoord te herstel, klik op 'Vergeet Wagwoord' of gaan na Instellings > Rekeningsekuriteit.", zu: "Ukuze usethe kabusha iphasiwedi, chofoza ku-'Forgot Password'." }
  },
  {
    keywords: ["account issue", "login issue", "cant login", "rekening probleem", "kan nie aanmeld nie", "inkinga ye-akhawunti", "akunakwenzeka ukungena"],
    replies: { en: "If you're having trouble logging in, ensure your credentials are correct or reset your password. Contact support if the problem continues.", af: "As jy probleme ondervind om aan te meld, maak seker jou besonderhede is korrek of herstel jou wagwoord.", zu: "Qinisekisa ukuthi imininingwane yakho ilungile noma setha kabusha iphasiwedi yakho." }
  },
  {
    keywords: ["pay rent", "payment", "rent payment", "make payment", "betaal huur", "betaling", "khokha irenti", "ukukhokha irenti"],
    replies: { en: "You can pay your rent via 'Payments' in your dashboard. Choose your preferred payment method and follow the instructions.", af: "Jy kan jou huur betaal via 'Betalings' in jou dashboard.", zu: "Ungakhokha irenti yakho ngaphansi kwe-'Payments' kudashboard." }
  },
  {
    keywords: ["payment history", "previous payments", "view transactions", "betaling geskiedenis", "voormalige betalings", "imbuyekezo yokukhokha", "buka izinkokhelo zangaphambilini"],
    replies: { en: "You can see your payment history under 'Payments' in your dashboard.", af: "Kyk na jou betalingsgeskiedenis onder 'Betalings' in jou dashboard.", zu: "Bheka umlando wokukhokha ngaphansi kwe-'Payments'." }
  },
  {
    keywords: ["late payment", "payment failed", "rent not going through", "laat betaling", "betaling misluk", "inkokhelo ye-renti ayiphumelelanga", "ukukhokha sekwephuzile"],
    replies: { en: "If your payment failed, check your network connection and card details. You can also try another payment method.", af: "As jou betaling misluk het, kyk asseblief jou netwerk en kaartbesonderhede.", zu: "Uma inkokhelo ihlulekile, hlola uxhumano lwakho kanye nemininingwane yekhadi." }
  },
  {
    keywords: ["maintenance support", "log maintenance request", "log maintenance", "property issues", "i got property issues", "onderhoud ondersteuning", "registreer onderhoudsversoek", "usizo lokulungisa", "nginokuphazamiseka kwempahla"],
    replies: { en: "I can help you log a new maintenance request. Go to your dashboard or settings and select 'Log Maintenance Request'.", af: "Ek kan jou help om 'n nuwe instandhoudingsversoek te registreer.", zu: "Ngizokwenza kube lula ukufaka isicelo sokulungisa impahla." }
  },
  {
    keywords: ["caretaker", "request caretaker", "call caretaker", "versorger", "versorger versoek", "umphathi wezindlu", "cela umphathi wezindlu"],
    replies: { en: "You can contact your assigned caretaker through the 'Property Details' section or 'Maintenance Support' in your dashboard.", af: "Jy kan jou opsigter kontak onder 'Eiendomsbesonderhede'.", zu: "Xhumana nomnakekeli wakho ngaphansi kwe-'Property Details'." }
  },
  {
    keywords: ["notifications", "alerts", "updates", "kennisgewings", "opdaterings", "izaziso", "izibuyekezo"],
    replies: { en: "You can manage your notifications in Settings under 'Notification Preferences'.", af: "Jy kan kennisgewings bestuur in Instellings onder 'Kennisgewingvoorkeure'.", zu: "Phatha izaziso zakho ngaphansi kwe-'Settings > Notifications'." }
  },
  {
    keywords: ["turn off notifications", "disable alerts", "skakel kennisgewings af", "deaktiveer waarskuwings", "vala izaziso", "khubaza izexwayiso"],
    replies: { en: "To turn off notifications, go to Settings > Notifications and toggle off the alerts you don't want to receive.", af: "Om kennisgewings af te skakel, gaan na Instellings > Kennisgewings.", zu: "Ukuze ucishe izaziso, iya ku-'Settings > Notifications'." }
  },
  {
    keywords: ["upload document", "submit document", "id proof", "proof of income", "laai dokument op", "dien dokument in", "thumela umbhalo", "ubufakazi bemali engenayo"],
    replies: { en: "To upload documents, go to your application form or profile and select 'Upload Documents'.", af: "Om dokumente op te laai, gaan na jou profiel of aansoekvorm.", zu: "Ukuze ulayishe amadokhumenti, iya ku-'Profile' noma 'Application Form'." }
  },
  {
    keywords: ["view documents", "download lease", "download invoice", "sien dokumente", "laai huurkontrak af", "thumela umbhalo", "landa i-invoyisi"],
    replies: { en: "You can view or download your documents in Settings under 'My Documents'.", af: "Jy kan dokumente bekyk of aflaai in Instellings onder 'My Dokumente'.", zu: "Ungabuka noma ulande amadokhumenti ngaphansi kwe-'My Documents'." }
  },
  {
    keywords: ["dashboard", "home screen", "main menu", "dashboard", "tuis skerm", "ikhasi lasekhaya"],
    replies: { en: "You can access your dashboard from the bottom navigation bar. It gives you quick access to leases, payments, and maintenance.", af: "Gaan na jou dashboard vir vinnige toegang tot huurkontrakte, betalings en instandhouding.", zu: "Vakashela i-dashboard yakho ukuze uthole ukufinyelela okusheshayo." }
  },
  {
    keywords: ["settings", "account settings", "instellings", "rekeninginstellings", "izilungiselelo", "izilungiselelo ze-akhawunti"],
    replies: { en: "You can find account settings in the top-right menu or the sidebar of your dashboard.", af: "Jy kan rekeninginstellings vind in die boonste regterhoek van jou dashboard.", zu: "Ungathola izilungiselelo zakho ze-akhawunti ku-'Dashboard Menu'." }
  },
  {
    keywords: ["what are you", "who are you", "what is your purpose", "wie is jy", "wat is jou doel", "ngubani wena", "injani injongo yakho"],
    replies: { en: "I’m your personal Nestify AI assistant! I can help you navigate the app, log maintenance requests, view leases, and more.", af: "Ek is jou persoonlike Nestify AI-assistent! Ek help jou om deur die app te navigeer.", zu: "Ngiyisisebenzi sakho se-Nestify AI! Ngisiza nge-app, ukufaka izicelo, nokubuka inkontileka." }
  },
  {
    keywords: ["Should we call Rikishi... Rikishi", "Moet ons Rikishi noem... Rikishi", "Sidinga ukumbiza uRikishi... Rikishi"],
    replies: { en: "Yes you should", af: "Ja, jy moet", zu: "Yebo kufanele" }
  }
];


// Function to detect intent using string similarity
function detectIntent(message: string): number {
  let bestMatch = { index: -1, rating: 0 };

  intents.forEach((intent, i) => {
    const result = stringSimilarity.findBestMatch(message.toLowerCase(), intent.keywords);
    if (result.bestMatch.rating > bestMatch.rating) {
      bestMatch = { index: i, rating: result.bestMatch.rating };
    }
  });

  return bestMatch.rating > 0.4 ? bestMatch.index : -1;
}

// Chat endpoint
router.post("/", (req: Request, res: Response) => {
  const { message, language } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const lang: keyof ChatIntent["replies"] = ["en", "af", "zu"].includes(language) ? language : "en";

  const index = detectIntent(message);
  const reply = index >= 0 ? intents[index].replies[lang] : {
    en: "Sorry, I didn’t quite understand that.",
    af: "Jammer, ek het dit nie heeltemal verstaan nie.",
    zu: "Uxolo, angikuqondanga kahle."
  }[lang];

  return res.json({ reply });
});

export default router;




