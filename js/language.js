/**
 * FoodBridge - Multilingual Support
 * English and Hindi language toggle
 */

const translations = {
  en: {
    nav_home: 'Home',
    nav_browse: 'Browse Surplus',
    nav_how: 'How It Works',
    nav_about: 'About FoodBridge',
    nav_contact: 'Contact',
    hero_tag: 'Rescue Food · Reduce Waste · Share Hope',
    hero_title_1: 'Good Food Deserves a',
    hero_title_2: 'Second Chance.',
    hero_desc: 'Restaurants, hotels, supermarkets, and event organisers often have wholesome surplus food that goes to waste. FoodBridge bridges the gap with verified NGOs and shelters to coordinate transparent, responsible food rescues.',
    btn_donate: 'Donate Surplus Food',
    btn_find: 'Find Food Donations',
    stat_meals: 'Meals Provided',
    stat_donations: 'Surplus Batches',
    stat_weight: 'Surplus Rescued',
    stat_co2: 'CO₂e Prevented',
    safety_notice: 'Food Safety & Responsible Donation Notice',
    lang_toggle: 'हिन्दी में देखें'
  },
  hi: {
    nav_home: 'होम',
    nav_browse: 'अतिरिक्त भोजन देखें',
    nav_how: 'यह कैसे काम करता है',
    nav_about: 'फ़ूडब्रिज के बारे में',
    nav_contact: 'संपर्क करें',
    hero_tag: 'भोजन बचाएँ · बर्बादी रोकें · उम्मीद साझा करें',
    hero_title_1: 'अच्छे भोजन को मिलना चाहिए',
    hero_title_2: 'दूसरा मौक़ा।',
    hero_desc: 'रेस्तराँ, होटल, सुपरमार्केट और आयोजकों के पास अक्सर अतिरिक्त भोजन होता है जो बर्बाद हो जाता है। FoodBridge सत्यापित NGOs और आश्रयों के साथ मिलकर जिम्मेदार भोजन बचाव का समन्वय करता है।',
    btn_donate: 'अतिरिक्त भोजन दान करें',
    btn_find: 'भोजन दान खोजें',
    stat_meals: 'भोजन उपलब्ध कराए',
    stat_donations: 'अतिरिक्त बैच',
    stat_weight: 'बचाया गया भोजन',
    stat_co2: 'CO₂e रोका गया',
    safety_notice: 'खाद्य सुरक्षा और जिम्मेदार दान नोटिस',
    lang_toggle: 'View in English'
  }
};

const languageManager = {
  currentLang: 'en',

  init() {
    const saved = localStorage.getItem('foodbridge_lang') || 'en';
    this.currentLang = saved;
    this.applyLanguage(saved);

    const toggleBtns = document.querySelectorAll('.lang-toggle-btn');
    toggleBtns.forEach(btn => {
      btn.textContent = translations[saved].lang_toggle;
      btn.addEventListener('click', () => {
        const newLang = this.currentLang === 'en' ? 'hi' : 'en';
        this.currentLang = newLang;
        localStorage.setItem('foodbridge_lang', newLang);
        this.applyLanguage(newLang);
        btn.textContent = translations[newLang].lang_toggle;
      });
    });
  },

  t(key) {
    return (translations[this.currentLang] || translations.en)[key] || key;
  },

  applyLanguage(lang) {
    const t = translations[lang] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key]) el.textContent = t[key];
    });
  }
};
