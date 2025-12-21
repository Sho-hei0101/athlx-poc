export const translations = {
  EN: {
    // Navigation
    home: 'Home',
    market: 'Test Environment',
    about: 'About AthleteXchange',
    news: 'Sports News',
    myPage: 'My Page',
    
    // Auth
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    
    // MetaMask / Demo Session
    connectMetaMask: 'Demo Session ID',
    disconnect: 'Disconnect',
    connected: 'Session',
    balance: 'Demo Balance',
    
    // Common
    price: 'Activity Index',
    volume: 'Activity Volume',
    change24h: '24h Change',
    change7d: '7d Change',
    buy: 'Acquire Units',
    sell: 'Release Units',
    confirm: 'Confirm',
    cancel: 'Cancel',
    
    // Categories
    amateur: 'Amateur',
    semiPro: 'Semi-pro',
    pro: 'Pro',
    elite: 'Elite',
    
    // Hero
    heroTitle: 'Support athletes directly.',
    heroSubtitle: 'A closed pilot demo where participation helps simulate athlete support allocation — demo credits only.',
    exploreMarket: 'Explore Test Environment',
    registerAthlete: 'Register as Athlete',
    
    // Admin
    adminPanel: 'Admin Panel',
    adminPassword: 'Admin PIN',
    enterPassword: 'Enter PIN',
    
    // Athlete Registration
    athleteRegistration: 'Athlete Registration',
    submit: 'Submit',
    
    // News
    readMore: 'Read more',
    
    // Disclaimer
    disclaimerBanner: 'ATHLX Pilot Program — Test environment. Demo credits only. No real-world value.',
    
    // Additional Terms
    athleteUnits: 'Athlete Units',
    demoCredits: 'Demo Credits (tATHLX)',
    activityIndex: 'Activity Index (pts)',
    postCareerSupport: 'Post-Career Support Vault',
    demoOnly: 'Demo-only. No real-world value.',
    testEnvironment: 'Test Environment',
    athleteDirectory: 'Athlete Directory'
  },
  ES: {
    // Navigation
    home: 'Inicio',
    market: 'Entorno de Prueba',
    about: 'Sobre AthleteXchange',
    news: 'Noticias Deportivas',
    myPage: 'Mi Página',
    
    // Auth
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    logout: 'Cerrar Sesión',
    email: 'Correo',
    password: 'Contraseña',
    name: 'Nombre',
    
    // MetaMask / Demo Session
    connectMetaMask: 'ID de Sesión Demo',
    disconnect: 'Desconectar',
    connected: 'Sesión',
    balance: 'Saldo Demo',
    
    // Common
    price: 'Índice de Actividad',
    volume: 'Volumen de Actividad',
    change24h: 'Cambio 24h',
    change7d: 'Cambio 7d',
    buy: 'Adquirir Unidades',
    sell: 'Liberar Unidades',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    
    // Categories
    amateur: 'Amateur',
    semiPro: 'Semi-profesional',
    pro: 'Profesional',
    elite: 'Élite',
    
    // Hero
    heroTitle: 'Apoya a los atletas directamente.',
    heroSubtitle: 'Un piloto cerrado para simular apoyo a atletas — solo créditos demo.',
    exploreMarket: 'Explorar Entorno de Prueba',
    registerAthlete: 'Registrarse como Atleta',
    
    // Admin
    adminPanel: 'Panel de Administración',
    adminPassword: 'PIN de Admin',
    enterPassword: 'Introducir PIN',
    
    // Athlete Registration
    athleteRegistration: 'Registro de Atleta',
    submit: 'Enviar',
    
    // News
    readMore: 'Leer más',
    
    // Disclaimer
    disclaimerBanner: 'Programa Piloto ATHLX — Entorno de prueba. Solo créditos demo. Sin valor en el mundo real.',
    
    // Additional Terms
    athleteUnits: 'Unidades del Atleta',
    demoCredits: 'Créditos Demo (tATHLX)',
    activityIndex: 'Índice de Actividad (pts)',
    postCareerSupport: 'Fondo de Apoyo Post-Carrera',
    demoOnly: 'Solo demo. Sin valor en el mundo real.',
    testEnvironment: 'Entorno de Prueba',
    athleteDirectory: 'Directorio de Atletas'
  }
};

export const t = (key: keyof typeof translations.EN, lang: 'EN' | 'ES' = 'EN'): string => {
  return translations[lang][key] || translations.EN[key];
};
