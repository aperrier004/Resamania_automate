import os
from playwright.sync_api import sync_playwright
from datetime import datetime, timedelta

def register_to_class():
    with sync_playwright() as p:
        # Lancement du navigateur en mode "headless" (invisible)
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Connexion
        page.goto("https://www.ton-site-de-sport.com/login")
        page.fill('input[name="email"]', "ton_email@exemple.com")
        page.fill('input[name="password"]', "ton_mot_de-passe")
        page.click('button[type="submit"]')

        # 2. Calcul de la date (J+8)
        target_date = (datetime.now() + timedelta(days=8)).strftime("%d/%m/%Y")
        print(f"Recherche du cours pour le : {target_date}")

        # 3. Navigation vers le planning et clic
        # C'est ici qu'il faudra adapter le sélecteur selon le site
        page.goto("https://www.ton-site-de-sport.com/planning")
        # Exemple : on cherche un bouton qui contient la date
        page.click(f"text={target_date}")
        page.click("text=S'inscrire")

        print("Inscription réussie !")
        browser.close()

if __name__ == "__main__":
    register_to_class()
