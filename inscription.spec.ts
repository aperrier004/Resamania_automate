import { test, expect } from '@playwright/test';

test('Inscription cours J+8', async ({ page }) => {
  // 1. Calcul de la date cible (J+8)
  const target = new Date();
  target.setDate(target.getDate() + 8);
  
  // Formatage : on s'adapte au format du site (ex: "18 avril 2026")
  const day = target.getDate();
  const month = target.toLocaleString('fr-FR', { month: 'long' });
  const formattedDate = `${day} ${month}`; 

  console.log(`Cible : ${formattedDate}`);

  // 2. Connexion (Utilisation des variables d'environnement pour la sécurité)
  await page.goto('https://member.resamania.com/lscfitnforme');
  await page.fill('input[type="email"]', process.env.USER_EMAIL!);
  await page.fill('input[type="password"]', process.env.USER_PASSWORD!);
  await page.click('button[type="submit"]');

  // 3. Navigation et sélection
  await page.goto('https://www.ton-site-de-sport.com/planning');
  
  // On cherche le conteneur qui contient notre date, puis le bouton dedans
  // C'est ici qu'on utilise la puissance de Playwright
  const courseRow = page.locator('.MuiBox-root', { hasText: 'Yoga' }) // Remplacez 'Yoga' par votre cours
                        .filter({ hasText: formattedDate });
  
  await courseRow.getByRole('button', { name: /s'inscrire|réserver/i }).click();

  // 4. Vérification
  await expect(page.getByText(/confirmation|succès/i)).toBeVisible();
});
