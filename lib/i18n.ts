export type Language = "en" | "hi" | "mr";

export const translations = {
  en: {
    title: "Got a job offer? Check it before you pay.",
    subtitle: "Paste the message, upload a screenshot or check a number/UPI. Get Safe / Suspicious / Scam in seconds.",
    bannerCount: "1,840 offers checked today",
    bannerAlert: "Alert: Telegram task scams asking for fee deposit",
    tabPaste: "Paste Message",
    tabUpload: "Upload Screenshot",
    tabDirect: "Check Number / UPI",
    tabVerify: "Verify Letter",
    placeholderPaste: "Paste a WhatsApp/Telegram job message, email, or offer text...",
    placeholderDirect: "Enter 10-digit mobile number (e.g. 9876543210) or UPI ID...",
    btnCheck: "Check this offer",
    btnChecking: "Checking signals...",
    btnUpload: "Select Image or PDF",
    btnShare: "Share Warning Card",
    btnReport: "Report this Scam",
    btnCheckAnother: "Check another offer",
    btnCopy1930: "Copy 1930 Complaint",
    btnCall1930: "Call 1930 Helpline",
    copied: "Copied to clipboard!",
    step1: "Extracting contact identifiers & salary claims...",
    step2: "Cross-referencing 2-hop fraud graph...",
    step3: "Validating against official employer registries...",
    step4: "Computing confidence & plain-language verdict...",
    verdictSafe: "Safe",
    verdictSuspicious: "Suspicious",
    verdictScam: "Scam",
    reasonsTitle: "Reasons & Red Flags",
    networkTitle: "Fraud Network Correlation",
    networkLinked: (reports: number, cities: number) =>
      `Connected to ${reports} scam report${reports === 1 ? "" : "s"} across ${cities} cit${cities === 1 ? "y" : "ies"}.`,
    reportTitle: "Report Scam to 1930 Portal",
    reportSubtitle: "Your report immediately flags this fraudster in the network and warns other job seekers.",
    reportTypeLabel: "Scam Type",
    amountLostLabel: "Money Lost (Rs, optional)",
    reportSubmit: "Submit Report & Generate 1930 Complaint",
    reportSuccess: "Report Recorded & Network Updated",
    letterVerifyTitle: "Verify Company Offer Letter",
    letterVerifySubtitle: "Enter the Offer Letter ID or scan QR code to check onchain Base Sepolia attestation.",
    letterPlaceholder: "e.g. TCS-2026-ENG-089",
    letterBtn: "Verify Letter",
    letterValid: "Verified by the company",
    letterInvalid: "Not issued by this company / Tampered",
    micBtn: "Voice Input",
    micListening: "Listening... speak now",
    micUnsupported: "Voice input is not supported in this browser.",
    speakVerdict: "Listen to Verdict",
    speaking: "Speaking...",
    stopSpeaking: "Stop Audio",
  },
  hi: {
    title: "नौकरी का ऑफर मिला? पैसे देने से पहले जांचें।",
    subtitle: "संदेश पेस्ट करें, स्क्रीनशॉट अपलोड करें या UPI ID जांचें। कुछ ही सेकंड में सुरक्षित / संदिग्ध / घोटाला जानें।",
    bannerCount: "आज 1,840 जॉब ऑफर की जांच की गई",
    bannerAlert: "अलर्ट: टेलीग्राम टास्क घोटाले में रजिस्ट्रेशन फीस मांगी जा रही है",
    tabPaste: "संदेश पेस्ट करें",
    tabUpload: "स्क्रीनशॉट अपलोड",
    tabDirect: "नंबर / UPI जांचें",
    tabVerify: "लेटर सत्यापित करें",
    placeholderPaste: "व्हाट्सएप/टेलीग्राम संदेश, ईमेल या ऑफर लेटर पेस्ट करें...",
    placeholderDirect: "10 अंकों का मोबाइल नंबर (जैसे 9876543210) या UPI ID दर्ज करें...",
    btnCheck: "इसकी जांच करें",
    btnChecking: "जांच जारी है...",
    btnUpload: "फोटो या PDF चुनें",
    btnShare: "चेतावनी कार्ड शेयर करें",
    btnReport: "इस घोटाले की शिकायत करें",
    btnCheckAnother: "दूसरी नौकरी जांचें",
    btnCopy1930: "1930 शिकायत कॉपी करें",
    btnCall1930: "1930 हेल्पलाइन पर कॉल करें",
    copied: "कॉपी कर लिया गया!",
    step1: "पहचानकर्ता और फीस की जानकारी निकाली जा रही है...",
    step2: "धोखाधड़ी नेटवर्क (2-hop graph) में मिलान हो रहा है...",
    step3: "कंपनी के आधिकारिक रिकॉर्ड से पुष्टि हो रही है...",
    step4: "अंतिम निष्कर्ष और सलाह तैयार की जा रही है...",
    verdictSafe: "सुरक्षित",
    verdictSuspicious: "संदिग्ध",
    verdictScam: "घोटाला (Scam)",
    reasonsTitle: "कारण और खतरे के संकेत",
    networkTitle: "धोखाधड़ी नेटवर्क से संबंध",
    networkLinked: (reports: number, cities: number) =>
      `${cities} शहरों में ${reports} पुष्टि की गई धोखाधड़ी शिकायतों से जुड़ा हुआ है।`,
    reportTitle: "1930 पोर्टल पर शिकायत दर्ज करें",
    reportSubtitle: "आपकी रिपोर्ट से यह नंबर तुरंत ब्लॉकलिस्ट में जुड़ जाएगा और अन्य लोग बच सकेंगे।",
    reportTypeLabel: "घोटाले का प्रकार",
    amountLostLabel: "गंवाई गई राशि (रुपये, यदि लागू हो)",
    reportSubmit: "रिपोर्ट भेजें और 1930 शिकायत प्राप्त करें",
    reportSuccess: "रिपोर्ट दर्ज हो गई और नेटवर्क अपडेट हो गया",
    letterVerifyTitle: "कंपनी ऑफर लेटर सत्यापित करें",
    letterVerifySubtitle: "लेटर आईडी दर्ज करें और ऑनचेन Base Sepolia प्रमाण की पुष्टि करें।",
    letterPlaceholder: "उदा. TCS-2026-ENG-089",
    letterBtn: "लेटर जांचें",
    letterValid: "कंपनी द्वारा आधिकारिक रूप से जारी",
    letterInvalid: "कंपनी द्वारा जारी नहीं किया गया / छेड़छाड़ की गई",
    micBtn: "बोलकर बताएं",
    micListening: "सुन रहे हैं... बोलिए...",
    micUnsupported: "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है।",
    speakVerdict: "निष्कर्ष सुनें",
    speaking: "बोल रहे हैं...",
    stopSpeaking: "आवाज़ रोकें",
  },
  mr: {
    title: "नोकरीची ऑफर मिळाली? पैसे देण्यापूर्वी तपासा.",
    subtitle: "मेसेज पेस्ट करा, स्क्रीनशॉट अपलोड करा किंवा UPI तपासा. काही सेकंदात सुरक्षित / संशयास्पद / फसवणूक ओळखा.",
    bannerCount: "आज 1,840 ऑफर्स तपासल्या",
    bannerAlert: "सतर्कता: टेलिग्राम टास्क घोटाळ्यात नोंदणी फी मागितली जात आहे",
    tabPaste: "मेसेज पेस्ट करा",
    tabUpload: "स्क्रीनशॉट अपलोड",
    tabDirect: "नंबर / UPI तपासा",
    tabVerify: "लेटर तपासा",
    placeholderPaste: "व्हॉट्सॲप/टेलिग्राम संदेश, ईमेल किंवा नोकरीची माहिती पेस्ट करा...",
    placeholderDirect: "10 अंकी मोबाईल नंबर किंवा UPI ID टाका...",
    btnCheck: "ऑफर तपासा",
    btnChecking: "तपासणी सुरू आहे...",
    btnUpload: "फोटो किंवा PDF निवडा",
    btnShare: "चेतावणी कार्ड शेअर करा",
    btnReport: "तक्रार नोंदवा",
    btnCheckAnother: "दुसरी ऑफर तपासा",
    btnCopy1930: "1930 तक्रार कॉपी करा",
    btnCall1930: "1930 वर कॉल करा",
    copied: "कॉपी केले!",
    step1: "माहिती आणि संशयास्पद बाबी शोधत आहे...",
    step2: "फसवणूक नेटवर्कमध्ये शोध घेत आहे...",
    step3: "अधिकृत कंपनी माहितीशी पडताळणी करत आहे...",
    step4: "अंतिम निकाल तयार करत आहे...",
    verdictSafe: "सुरक्षित",
    verdictSuspicious: "संशयास्पद",
    verdictScam: "फसवणूक (Scam)",
    reasonsTitle: "कारणे आणि धोक्याचे इशारे",
    networkTitle: "फसवणूक नेटवर्क संबंध",
    networkLinked: (reports: number, cities: number) =>
      `${cities} शहरांमधील ${reports} फसवणूक अहवालांशी जोडलेले आहे.`,
    reportTitle: "1930 पोर्टलवर तक्रार करा",
    reportSubtitle: "आपल्या अहवालामुळे हा फसवणूक करणारा त्वरित ओळखला जाईल आणि इतरांचे नुकसान टळेल.",
    reportTypeLabel: "घोटाळ्याचा प्रकार",
    amountLostLabel: "गमावलेली रक्कम (रुपये)",
    reportSubmit: "तक्रार सबमिट करा आणि मसुदा मिळवा",
    reportSuccess: "तक्रार नोंदवली आणि नेटवर्क अपडेट झाले",
    letterVerifyTitle: "कंपनी ऑफर लेटर पडताळणी",
    letterVerifySubtitle: "ऑफर लेटर आयडी टाका आणि Base Sepolia वरील खात्री तपासा.",
    letterPlaceholder: "उदा. TCS-2026-ENG-089",
    letterBtn: "लेटर तपासा",
    letterValid: "कंपनीद्वारे अधिकृतपणे सत्यापित",
    letterInvalid: "कंपनीने जारी केलेले नाही / छेडछाड केलेली",
    micBtn: "आवाजाने सांगा",
    micListening: "ऐकत आहोत... बोला...",
    micUnsupported: "या ब्राउझरमध्ये व्हॉइस इनपुट समर्थित नाही.",
    speakVerdict: "निष्कर्ष ऐका",
    speaking: "बोलत आहोत...",
    stopSpeaking: "आवाज थांबवा",
  },
};

/**
 * Maps product language code to BCP 47 speech synthesis & recognition locale.
 */
export function getSpeechLanguage(lang: Language): string {
  switch (lang) {
    case "hi":
      return "hi-IN";
    case "mr":
      return "mr-IN";
    default:
      return "en-IN";
  }
}

/**
 * Formats a clear, natural sentence for speech synthesis in the selected language.
 */
export function formatSpokenVerdict(
  verdict: "safe" | "suspicious" | "scam",
  confidence: number,
  firstReason?: string,
  lang: Language = "en",
): string {
  const pct = Math.round(confidence * 100);

  if (lang === "hi") {
    switch (verdict) {
      case "scam":
        return `सावधान! यह नौकरी निश्चित रूप से एक घोटाला है। इसका विश्वास स्तर ${pct} प्रतिशत है। मुख्य कारण: ${
          firstReason ?? "धोखाधड़ी के संकेत पाए गए हैं।"
        } कृपया कोई भी पैसा न दें।`;
      case "suspicious":
        return `चेतावनी! यह जॉब ऑफर संदिग्ध है। इसका विश्वास स्तर ${pct} प्रतिशत है। मुख्य कारण: ${
          firstReason ?? "संदेहास्पद मांग की गई है।"
        } कंपनी से सीधे पुष्टि किए बिना कोई भुगतान न करें।`;
      default:
        return `यह जॉब ऑफर फिलहाल सुरक्षित प्रतीत होता है। कोई स्पष्ट लाल झंडे नहीं मिले, लेकिन हमेशा सतर्क रहें।`;
    }
  }

  if (lang === "mr") {
    switch (verdict) {
      case "scam":
        return `सावधान! ही नोकरी पूर्णपणे फसवणूक आहे. विश्वासार्हता ${pct} टक्के आहे. मुख्य कारण: ${
          firstReason ?? "फसवणुकीचे संकेत आढळले आहेत."
        } कृपया कोणतेही पैसे देऊ नका.`;
      case "suspicious":
        return `इशारा! ही नोकरी संशयास्पद आहे. विश्वासार्हता ${pct} टक्के आहे. मुख्य कारण: ${
          firstReason ?? "संशयास्पद मागणी आढळली आहे."
        } कंपनीशी थेट संपर्क साधल्याशिवाय पैसे देऊ नका.`;
      default:
        return `ही ऑफर सुरक्षित दिसत आहे. कोणतेही स्पष्ट धोक्याचे संकेत आढळले नाहीत. सावध रहा.`;
    }
  }

  // English (default)
  switch (verdict) {
    case "scam":
      return `Warning! This job offer is a confirmed scam with ${pct} percent confidence. Reason: ${
        firstReason ?? "fraudulent fee demand detected."
      } Do not send any money.`;
    case "suspicious":
      return `Attention! This job offer is suspicious with ${pct} percent confidence. Reason: ${
        firstReason ?? "unverified claims detected."
      } Verify with the company directly before you pay anything.`;
    default:
      return `This job offer appears safe. No immediate red flags were detected, but always stay cautious.`;
  }
}

