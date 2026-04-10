import { test, expect } from '@playwright/test';

// 1. CONFIGURATION CORRIGÉE (0=Dimanche, 1=Lundi, etc.)
const MY_SCHEDULE: { [key: number]: { name: string, time: string }[] } = {
  1: [{ name: "Body Sculpt", time: "12:15" }, { name: "LM Core", time: "19:15" }], // Lundi
  2: [{ name: "100% fessiers", time: "18:30" }],                                 // Mardi
  3: [{ name: "TRX Circuit", time: "19:00" }],                                   // Mercredi
  4: [{ name: "Cardio sculpt", time: "18:45" }],                                 // Jeudi
  5: [                                                                           // Vendredi
    { name: "Yoga Vinyasa niveau avancé", time: "12:15" }, 
    { name: "Yoga Vinyasa niveau avancé", time: "18:15" }
  ],
  6: [                                                                           // Samedi
    { name: "Yoga Vinyasa niveau avancé", time: "13:30" }, 
    { name: "Méditation", time: "14:30" }
  ],
  // 0: [] (Dimanche)
};

test('Inscription Automatique Sport J+8', async ({ page }) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 8);
  
  const isoDate = targetDate.toISOString().split('T')[0];
  const dayOfWeek = targetDate.getDay(); 

  const coursesToBook = MY_SCHEDULE[dayOfWeek];

  if (!coursesToBook || coursesToBook.length === 0) {
    console.log("Pas de cours prévu dans 8 jours.");
    return;
  }

  // Connexion (une seule fois pour tous les cours du jour)
  await page.goto('https://member.resamania.com/lscfitnforme/login');
  await page.fill('#login_step_login_username', process.env.USER_EMAIL!);
  await page.fill('#_password', process.env.USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');

  // Boucle sur les cours du jour
  for (const courseConfig of coursesToBook) {
    console.log(`Tentative pour : ${courseConfig.name} à ${courseConfig.time}`);
    
    const targetUrl = `https://member.resamania.com/lscfitnforme/planning?club=%2Flscfitnforme%2Fclubs%2F985&startedAt=${isoDate}`;
    await page.goto(targetUrl);

    // Recherche du bloc spécifique
    const courseCard = page.locator('.MuiListItem-root', { hasText: courseConfig.time })
                           .filter({ hasText: courseConfig.name });

    const bookingButton = courseCard.getByRole('button', { name: /s'inscrire|réserver/i });

    try {
      await bookingButton.waitFor({ state: 'visible', timeout: 5000 });
      await bookingButton.click();

      const confirmBtn = page.getByRole('button', { name: "Confirmer" });
      if (await confirmBtn.isVisible({ timeout: 3000 })) {
          await confirmBtn.click();
          console.log(`✅ Succès : ${courseConfig.name}`);
      }
    } catch (e) {
      console.log(`❌ Échec ou déjà inscrit pour ${courseConfig.name}`);
    }
  }
});
