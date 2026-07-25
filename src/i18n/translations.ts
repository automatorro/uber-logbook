export type Lang = 'ro' | 'en';

export interface Translations {
  nav: {
    brand: string;
    report: string;
    settings: string;
    logout: string;
  };
  dashboard: {
    welcome: string;
    title: string;
    statDays: string;
    statKmTotal: string;
    statKmMonth: string;
    addSectionLabel: string;
    addDateLabel: string;
    addButton: string;
    addHint: string;
    historySectionTitle: string;
    historyCount: (days: number, trips: number) => string;
    syncBtn: string;
    syncingBtn: string;
    reportBtn: string;
    syncMessage: string;
    emptyTitle: string;
    emptyText: string;
    migrationTitle: string;
    migrationText: string;
    migrationBtn: string;
    migrationConfirm: string;
    deleteConfirm: string;
    alreadyExists: string;
    loading: string;
    trips: string;
  };
  edit: {
    title: string;
    sectionMileage: string;
    kmStart: string;
    kmEnd: string;
    startTime: string;
    endTime: string;
    sectionActivity: string;
    tripCount: string;
    route: string;
    sectionFuel: string;
    liters: string;
    value: string;
    station: string;
    stationPlaceholder: string;
    bill: string;
    billPlaceholder: string;
    fuelingDate: string;
    addFuelingBtn: string;
    removeFuelingBtn: string;
    noFuelingsText: string;
    dailyTotalLabel: string;
    save: string;
    cancel: string;
    kmError: string;
    loading: string;
  };
  settings: {
    title: string;
    sectionPfa: string;
    pfaName: string;
    pfaCif: string;
    sectionVehicle: string;
    carBrand: string;
    carModel: string;
    carPlate: string;
    sectionAnaf: string;
    driverName: string;
    fuelNorm: string;
    defaultZone: string;
    saveBtn: string;
    loading: string;
  };
  login: {
    titleLogin: string;
    titleRegister: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    loginBtn: string;
    registerBtn: string;
    loadingBtn: string;
    switchToRegister: string;
    switchToLogin: string;
    switchToRegisterLink: string;
    switchToLoginLink: string;
    footer: string;
    error: string;
  };
  report: {
    filterTitle: string;
    printBtn: string;
    loading: string;
  };
}

const translations: Record<Lang, Translations> = {
  ro: {
    nav: {
      brand: 'Foaie Parcurs',
      report: 'Raport',
      settings: 'Setări',
      logout: 'Ieșire',
    },
    dashboard: {
      welcome: 'Bun venit înapoi',
      title: 'Activitate Uber 🚖',
      statDays: 'Zile lucrate',
      statKmTotal: 'Km total',
      statKmMonth: 'Km luna asta',
      addSectionLabel: '➕ Înregistrează o zi nouă',
      addDateLabel: 'Data',
      addButton: 'Adaugă Zi',
      addHint: '💡 Kilometrajul de start este completat automat din ultima zi înregistrată. Editează intrarea pentru a adăuga curse, alimentări și detalii.',
      historySectionTitle: 'Istoric activitate',
      historyCount: (days: number, trips: number) => `${days} ${days === 1 ? 'zi' : 'zile'} · ${trips} curse`,
      syncBtn: '🔄 Sincro KM',
      syncingBtn: '⏳ Se sincronizează...',
      reportBtn: '📄 Foaie Parcurs',
      syncMessage: '⏳ Se recalculează continuitatea kilometrajului pentru toată baza de date. Te rugăm să aștepți...',
      emptyTitle: 'Nicio zi înregistrată încă',
      emptyText: 'Selectează o dată de mai sus și apasă „Adaugă Zi" pentru a începe.',
      migrationTitle: '📦 Date locale detectate',
      migrationText: 'Ai date salvate pe acest dispozitiv care nu sunt încă în Cloud.',
      migrationBtn: 'Migrează',
      migrationConfirm: 'Dorești să imporți datele salvate local în Cloud? (Aceasta se face o singură dată)',
      deleteConfirm: 'Sigur vrei să ștergi această zi?',
      alreadyExists: 'Există deja o intrare pentru această dată!',
      loading: 'Se încarcă datele...',
      trips: 'curse',
    },
    edit: {
      title: 'Editează Ziua',
      sectionMileage: 'Kilometraj și Timp',
      kmStart: 'KM Start',
      kmEnd: 'KM Final',
      startTime: 'Ora Start',
      endTime: 'Ora Final',
      sectionActivity: 'Activitate',
      tripCount: 'Număr Curse',
      route: 'Rută / Zonă',
      sectionFuel: '⛽ Alimentare (Opțional)',
      liters: 'Litri',
      value: 'Valoare (RON)',
      station: 'Stație Carburant',
      stationPlaceholder: 'Ex: OMV, Rompetrol...',
      bill: 'Nr. Bon (Opțional)',
      billPlaceholder: 'Ex: 5678',
      fuelingDate: 'Data alimentării',
      addFuelingBtn: '+ Adaugă alimentare',
      removeFuelingBtn: '✕ Șterge',
      noFuelingsText: 'Nicio alimentare înregistrată. Apasă „+ Adaugă alimentare" pentru a înregistra.',
      dailyTotalLabel: 'Total zilnic',
      save: 'Salvează',
      cancel: 'Anulează',
      kmError: 'KM Final nu poate fi mai mic decât KM Start!',
      loading: 'Se încarcă...',
    },
    settings: {
      title: 'Setări Aplicație',
      sectionPfa: 'Informații PFA',
      pfaName: 'Nume PFA (Unitatea)',
      pfaCif: 'CIF PFA',
      sectionVehicle: 'Detalii Vehicul',
      carBrand: 'Marcă',
      carModel: 'Model',
      carPlate: 'Număr Înmatriculare',
      sectionAnaf: 'Configurări ANAF',
      driverName: 'Nume Șofer (Conducător auto)',
      fuelNorm: 'Normă Consum (L/100km)',
      defaultZone: 'Zonă Activitate (Implicită)',
      saveBtn: 'Salvează și Revino',
      loading: 'Se încarcă...',
    },
    login: {
      titleLogin: 'Autentificare',
      titleRegister: 'Creare Cont Uber Log',
      emailLabel: 'Email',
      emailPlaceholder: 'email@exemplu.com',
      passwordLabel: 'Parolă',
      passwordPlaceholder: 'minimum 8 caractere',
      loginBtn: '🔑 Conectare',
      registerBtn: '✅ Înregistrare',
      loadingBtn: '⏳ Se procesează...',
      switchToRegister: 'Nu ai cont?',
      switchToLogin: 'Ai deja cont?',
      switchToRegisterLink: 'Creează unul',
      switchToLoginLink: 'Conectează-te',
      footer: 'Aplicație personală pentru gestiunea foilor de parcurs.',
      error: 'Eroare de autentificare. Verifică datele.',
    },
    report: {
      filterTitle: 'Filtrare Raport',
      printBtn: '🖨️ Imprimă Raportul (A4)',
      loading: 'Se încarcă...',
    },
  },

  en: {
    nav: {
      brand: 'Trip Sheet',
      report: 'Report',
      settings: 'Settings',
      logout: 'Sign out',
    },
    dashboard: {
      welcome: 'Welcome back',
      title: 'Uber Activity 🚖',
      statDays: 'Days worked',
      statKmTotal: 'Total km',
      statKmMonth: 'This month km',
      addSectionLabel: '➕ Log a new day',
      addDateLabel: 'Date',
      addButton: 'Add Day',
      addHint: '💡 Starting mileage is auto-filled from the last logged day. Edit the entry to add trips, fuel-ups and details.',
      historySectionTitle: 'Activity history',
      historyCount: (days: number, trips: number) => `${days} ${days === 1 ? 'day' : 'days'} · ${trips} trips`,
      syncBtn: '🔄 Sync KM',
      syncingBtn: '⏳ Syncing...',
      reportBtn: '📄 Trip Sheet',
      syncMessage: '⏳ Recalculating mileage continuity across the entire database. Please wait...',
      emptyTitle: 'No days logged yet',
      emptyText: 'Select a date above and press "Add Day" to get started.',
      migrationTitle: '📦 Local data detected',
      migrationText: 'You have data saved on this device that is not yet in the Cloud.',
      migrationBtn: 'Migrate',
      migrationConfirm: 'Do you want to import the locally saved data to the Cloud? (This is done only once)',
      deleteConfirm: 'Are you sure you want to delete this day?',
      alreadyExists: 'An entry for this date already exists!',
      loading: 'Loading data...',
      trips: 'trips',
    },
    edit: {
      title: 'Edit Day',
      sectionMileage: 'Mileage & Time',
      kmStart: 'KM Start',
      kmEnd: 'KM End',
      startTime: 'Start Time',
      endTime: 'End Time',
      sectionActivity: 'Activity',
      tripCount: 'Trip Count',
      route: 'Route / Zone',
      sectionFuel: '⛽ Fueling (Optional)',
      liters: 'Liters',
      value: 'Value (RON)',
      station: 'Fuel Station',
      stationPlaceholder: 'e.g. OMV, Rompetrol...',
      bill: 'Receipt No. (Optional)',
      billPlaceholder: 'e.g. 5678',
      fuelingDate: 'Fueling date',
      addFuelingBtn: '+ Add fueling',
      removeFuelingBtn: '✕ Remove',
      noFuelingsText: 'No fuelings logged. Press "+ Add fueling" to record one.',
      dailyTotalLabel: 'Daily total',
      save: 'Save',
      cancel: 'Cancel',
      kmError: 'End KM cannot be less than Start KM!',
      loading: 'Loading...',
    },
    settings: {
      title: 'App Settings',
      sectionPfa: 'Company Info',
      pfaName: 'Company Name',
      pfaCif: 'Tax ID (CIF)',
      sectionVehicle: 'Vehicle Details',
      carBrand: 'Brand',
      carModel: 'Model',
      carPlate: 'License Plate',
      sectionAnaf: 'ANAF Configuration',
      driverName: 'Driver Name',
      fuelNorm: 'Fuel Norm (L/100km)',
      defaultZone: 'Default Activity Zone',
      saveBtn: 'Save & Go Back',
      loading: 'Loading...',
    },
    login: {
      titleLogin: 'Sign In',
      titleRegister: 'Create Uber Log Account',
      emailLabel: 'Email',
      emailPlaceholder: 'email@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: 'minimum 8 characters',
      loginBtn: '🔑 Sign In',
      registerBtn: '✅ Register',
      loadingBtn: '⏳ Processing...',
      switchToRegister: "Don't have an account?",
      switchToLogin: 'Already have an account?',
      switchToRegisterLink: 'Create one',
      switchToLoginLink: 'Sign in',
      footer: 'Personal app for managing trip sheets.',
      error: 'Authentication error. Please check your credentials.',
    },
    report: {
      filterTitle: 'Filter Report',
      printBtn: '🖨️ Print Report (A4)',
      loading: 'Loading...',
    },
  },
};

export default translations;
