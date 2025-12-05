
import { TestRecord, TestProfile, ConnectionType, TestResults } from '../types';

/**
 * Simulates network traffic patterns.
 */
export const simulateSpeed = (
  elapsedTime: number,
  targetSpeed: number,
  phaseDuration: number
): number => {
  const rampDuration = phaseDuration * 0.2;
  
  if (elapsedTime < rampDuration) {
    const progress = elapsedTime / rampDuration;
    return targetSpeed * (1 - Math.pow(1 - progress, 3));
  }

  const baseSpeed = targetSpeed;
  const fluctuation = (Math.random() - 0.5) * (targetSpeed * 0.15); 
  
  return Math.max(0, baseSpeed + fluctuation);
};

export const generateMockServers = () => [
  { id: 'auto', name: 'AUTO (Multi-Server)', location: 'Global / Local Best', distance: 0 },
  { id: 'cz-prg-o2', name: 'O2 Backbone', location: 'Praha', distance: 5 },
  { id: 'cz-brn-cetin', name: 'CETIN Aggregation', location: 'Brno', distance: 205 },
  { id: 'cz-nordic', name: 'Nordic Telecom', location: 'Praha', distance: 12 },
  { id: 'glb-google', name: 'Google Public DNS', location: 'Global Anycast', distance: 0 },
  { id: 'glb-cloudflare', name: 'Cloudflare', location: 'Global CDN', distance: 0 },
  { id: 'de-aws', name: 'AWS Frankfurt', location: 'Frankfurt, DE', distance: 510 },
  { id: 'sk-telekom', name: 'Slovak Telekom', location: 'Bratislava, SK', distance: 320 },
];

export const getProfiles = (): TestProfile[] => [
  // --- QUICK TEST PROFILES (Practical Use Cases) ---
  { 
    id: 'quick-gamer', 
    mode: 'QUICK',
    name: 'Online Hraní (Gaming)', 
    type: 'OPTICS', // Uses optics icon for low latency symbol
    description: 'Priorita: Nízká odezva (Ping) a stabilní Jitter. Ideální pro kontrolu lagu.',
    durationMinutes: 0.5,
    intervalMinutes: 0
  },
  { 
    id: 'quick-streaming', 
    mode: 'QUICK',
    name: 'Streaming 4K/8K', 
    type: '5G', // High bandwidth symbol
    description: 'Priorita: Maximální rychlost stahování. Test kapacity pro vysoké rozlišení.',
    durationMinutes: 0.5,
    intervalMinutes: 0
  },
  { 
    id: 'quick-office', 
    mode: 'QUICK',
    name: 'Home Office / Konference', 
    type: 'DSL', // Stability symbol
    description: 'Priorita: Stabilní upload a nulové výpadky pro Teams/Zoom hovory.',
    durationMinutes: 0.5,
    intervalMinutes: 0
  },
  { 
    id: 'quick-general', 
    mode: 'QUICK',
    name: 'Běžné Surfování', 
    type: 'WIFI', 
    description: 'Vyvážený test pro běžné domácí použití a sociální sítě.',
    durationMinutes: 0.5,
    intervalMinutes: 0
  },

  // --- LONG TERM PROFILES (Diagnostics) ---
  { 
    id: 'diag-stability', 
    mode: 'LONG_TERM',
    name: 'Analýza Stability (4h)', 
    type: 'DSL', 
    description: 'Dlouhodobý monitoring pro odhalení náhodných výpadků a kolísání.',
    durationMinutes: 240, // 4 hours
    intervalMinutes: 15
  },
  { 
    id: 'diag-infra', 
    mode: 'LONG_TERM',
    name: 'Test Infrastruktury (8h)', 
    type: 'OPTICS', 
    description: 'Hloubkový test fyzické vrstvy a agregačních bodů. Pracovní doba.',
    durationMinutes: 480, // 8 hours
    intervalMinutes: 30
  },
  { 
    id: 'diag-5g', 
    mode: 'LONG_TERM',
    name: '5G / LTE Monitoring', 
    type: '5G', 
    description: 'Testování vlivu rušení a vytížení sítě v čase (špičky vs. klid).',
    durationMinutes: 60,
    intervalMinutes: 5
  },
  { 
    id: 'diag-manual', 
    mode: 'LONG_TERM',
    name: 'Servisní / Manuální', 
    type: 'MANUAL', 
    description: 'Vlastní nastavení parametrů technikem.',
    durationMinutes: 60, 
    intervalMinutes: 10
  }
];

export const evaluateQuickTest = (results: TestResults, profileId: string): string => {
  const { ping, jitter, download, upload, loss } = results;

  if (loss > 5) {
    return "Varování: Bylo detekováno vysoké procento ztráty paketů. Připojení je nestabilní bez ohledu na rychlost.";
  }

  if (profileId.includes('gamer')) {
    if (ping < 20 && jitter < 10) return "Perfektní výsledek pro hraní her. Nízká odezva a stabilní jitter.";
    if (ping < 50) return "Dobré připojení pro většinu her, ale pro soutěžní hraní (FPS) může být odezva hraniční.";
    return "Připojení není optimální pro rychlé online hry kvůli vyšší odezvě (Ping > 50ms).";
  }

  if (profileId.includes('streaming')) {
    if (download > 100) return "Excelentní. Linka zvládne několik 4K streamů současně bez načítání.";
    if (download > 25) return "Dostačující pro streamování ve 4K (UHD) kvalitě pro jedno zařízení.";
    return "Rychlost stahování je nižší. Doporučujeme snížit kvalitu videa na Full HD (1080p).";
  }

  if (profileId.includes('office')) {
    if (upload > 10 && jitter < 30) return "Výborné pro videohovory (Teams/Zoom). Obraz i zvuk budou čisté.";
    if (upload > 2) return "Videohovory budou fungovat, ale při sdílení obrazovky nebo HD videu může docházet k zásekům.";
    return "Nízká rychlost nahrávání (Upload). Videohovory mohou být nekvalitní nebo vypadávat.";
  }

  // General fallback
  if (download > 50) return "Velmi rychlé připojení pro celou domácnost.";
  if (download > 10) return "Standardní připojení pro běžné použití, e-maily a sociální sítě.";
  return "Připojení je pomalejší než dnešní standard. Pro náročnější použití zvažte upgrade.";
};

export const generateReportSummary = (records: TestRecord[], profileName: string): string => {
  if (records.length === 0) return "Měření nebylo provedeno.";

  const avgDown = records.reduce((acc, r) => acc + r.download, 0) / records.length;
  const avgPing = records.reduce((acc, r) => acc + r.ping, 0) / records.length;
  
  // Use percentage threshold for errors to be more realistic for mobile/wifi
  const errorRate = records.filter(r => r.status === 'ERROR').length / records.length;
  const warningRate = records.filter(r => r.status === 'WARNING').length / records.length;

  let conclusion = "";
  if (errorRate > 0.1) { // > 10% errors is bad
    conclusion = `Linka vykazuje významnou nestabilitu (${(errorRate*100).toFixed(1)}% chybovost). Doporučena technická kontrola.`;
  } else if (warningRate > 0.2) {
    conclusion = `Linka je funkční, ale s kolísáním parametrů v zátěži. Může ovlivnit realtime aplikace.`;
  } else {
    conclusion = "Linka je stabilní. Naměřené hodnoty odpovídají standardům pro daný typ připojení.";
  }

  return `Diagnostika (${profileName}): Průměrná rychlost ${avgDown.toFixed(1)} Mb/s, odezva ${avgPing.toFixed(0)} ms. ${conclusion}`;
};

export const createExportContent = (records: TestRecord[], config: any, summary: string): string => {
  const header = `
================================================================
O2N DIAGNOSTICKÝ PROTOKOL
================================================================
Datum vygenerování: ${new Date().toLocaleString('cs-CZ')}
Profil měření: ${config.profileName}
Nastavení: Interval ${config.interval} min, Celková doba ${config.duration} min
Server: ${config.serverName}
================================================================

SOUHRN:
${summary}

================================================================
DETAILNÍ LOG MĚŘENÍ:
Čas\t\t| Ping (ms)\t| Down (Mb/s)\t| Up (Mb/s)\t| Stav
----------------------------------------------------------------
`;

  const rows = records.map(r => {
    const time = r.timestamp.toLocaleTimeString('cs-CZ');
    return `${time}\t| ${r.ping.toFixed(0)}\t\t| ${r.download.toFixed(1)}\t\t| ${r.upload.toFixed(1)}\t\t| ${r.status}`;
  }).join('\n');

  return header + rows + `\n\n================================================================\nGenerated by O2N App`;
};
