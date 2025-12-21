export const translations = {
  EN: {
    // Navigation
    home: 'Home',
    market: 'Market',
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
    
    // MetaMask
    connectMetaMask: 'Connect MetaMask',
    disconnect: 'Disconnect',
    connected: 'Connected',
    balance: 'Balance',
    
    // Common
    price: 'Price',
    volume: 'Trading Volume',
    change24h: '24h Change',
    change7d: '7d Change',
    buy: 'Buy',
    sell: 'Sell',
    confirm: 'Confirm',
    cancel: 'Cancel',
    
    // Categories
    amateur: 'Amateur',
    semiPro: 'Semi-pro',
    pro: 'Pro',
    elite: 'Elite',
    
    // Hero
    heroTitle: 'Invest in the future of athletes.',
    heroSubtitle: 'ATHLX turns your support into a sustainable financial ecosystem for players.',
    exploreMarket: 'Explore Market',
    registerAthlete: 'Register as Athlete',
    
    // Admin
    adminPanel: 'Admin Panel',
    adminPassword: 'Admin Password',
    enterPassword: 'Enter Password',
    
    // Athlete Registration
    athleteRegistration: 'Athlete Registration',
    submit: 'Submit',
    
    // News
    readMore: 'Read more'
  },
  ES: {
    // Navigation
    home: 'Inicio',
    market: 'Mercado',
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
    
    // MetaMask
    connectMetaMask: 'Conectar MetaMask',
    disconnect: 'Desconectar',
    connected: 'Conectado',
    balance: 'Saldo',
    
    // Common
    price: 'Precio',
    volume: 'Volumen de Trading',
    change24h: 'Cambio 24h',
    change7d: 'Cambio 7d',
    buy: 'Comprar',
    sell: 'Vender',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    
    // Categories
    amateur: 'Amateur',
    semiPro: 'Semi-profesional',
    pro: 'Profesional',
    elite: 'Élite',
    
    // Hero
    heroTitle: 'Invierte en el futuro de los atletas.',
    heroSubtitle: 'ATHLX convierte tu apoyo en un ecosistema financiero sostenible para los jugadores.',
    exploreMarket: 'Explorar Mercado',
    registerAthlete: 'Registrarse como Atleta',
    
    // Admin
    adminPanel: 'Panel de Administración',
    adminPassword: 'Contraseña de Admin',
    enterPassword: 'Introducir Contraseña',
    
    // Athlete Registration
    athleteRegistration: 'Registro de Atleta',
    submit: 'Enviar',
    
    // News
    readMore: 'Leer más'
  }
};

export const t = (key: keyof typeof translations.EN, lang: 'EN' | 'ES' = 'EN'): string => {
  return translations[lang][key] || translations.EN[key];
};
