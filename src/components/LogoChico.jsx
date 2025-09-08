import React, { useState, useEffect } from "react";

import TOM from "/src/assets/img/TOM.png";
import JESUSOLIVA from "/src/assets/img/Jesusoliva-old.png";
import POWERHOUSE from "/src/assets/img/Powerhouse.png";
import RAMABELTRAME from "/src/assets/img/RB.png";
import ARIELBRUNO from "/src/assets/img/ariel-logo.png";
import MATHIAS_RAGO from "/src/assets/img/mathias-logo.png";
import GERONIMO_BISANZIO from "/src/assets/img/geronimo-logo.jpeg";
import JEREMIAS_OLMEDO from "/src/assets/img/jeremias-olmedo.jpeg";
import MATIAS_VILLALBA from "/src/assets/img/matias-logo.jpeg";
import MATIAS_VILLALBA_PERSONAL from "/src/assets/img/Matias_villalba_personal.png";
import TORETTO_GYM from "/src/assets/img/mauri-logo.png";
import PITBULL from "/src/assets/img/pitbull-logo.png";
import CRISTIAN_QUIROGA from "/src/assets/img/cristian-logo.png";
import FRANCO from "/src/assets/img/Franco.jpeg";
import SOL from "/src/assets/img/SvStrong.jpeg";
import MARTIN_CASANOVA from "/src/assets/img/MartinCasanova.png";
import MACARENA from "/src/assets/img/Macarena.png";
import LEO_BURGIO from "/src/assets/img/Leo_burgio.png";
import VALU_MARCHE from "/src/assets/img/Valu_marche.png";
import AGUSTIN_ARENAS from "/src/assets/img/Agustin_arenas.png";
import LEONEL_ORTIZ from "/src/assets/img/Leonel_ortiz.png";
import GABRIEL_BELLEZA from "/src/assets/img/Gabriel_belleza.png";
import NICOLAS_ECHAZZA from "/src/assets/img/Nicolas_echazza.png";
import CAMILA_BENEITEZ from "/src/assets/img/camila-beneitez.png";

/** Logo por defecto */
const DEFAULT_LOGO = TOM;

/** Mapa centralizado: agregar aquí nuevos emails/ids -> logo */
const LOGO_MAP = {
  // ARIEL BRUNO
  "email:arielbruno97@gmail.com": ARIELBRUNO,
  "id:663b122634b3af9cafacb80c": ARIELBRUNO,

  // JESÚS OLIVA
  "email:jesusoliva@gmail.com": JESUSOLIVA,
  "id:648c06a7c3ce34126657a924": JESUSOLIVA,

  // MATHIAS RAGO
  "email:mathiasrago7@gmail.com": MATHIAS_RAGO,
  "id:66066ff46310dcb00ee20717": MATHIAS_RAGO,

  // GERÓNIMO BISANZIO
  "email:bisabisanzio@gmail.com": GERONIMO_BISANZIO,
  "id:660df0889e33d1815acf9506": GERONIMO_BISANZIO,

  // JEREMÍAS OLMEDO
  "email:jeremiasolmedo6@gmail.com": JEREMIAS_OLMEDO,
  "id:660680376310dcb00ee20719": JEREMIAS_OLMEDO,

  // MATÍAS VILLALBA (equipo)
  "email:matuch_27@hotmail.com": MATIAS_VILLALBA,
  "id:66156628e97c68ef705f451f": MATIAS_VILLALBA,

  // MATÍAS VILLALBA (personal)
  "email:matiasvill83@gmail.com": MATIAS_VILLALBA_PERSONAL,
  "id:65285e48af829c334f96e695": MATIAS_VILLALBA_PERSONAL,

  // PITBULL
  "email:alexisdalessandrod@gmail.com": PITBULL,
  "id:67f84082c3514ac86837bddf": PITBULL,

  // TORETTO GYM
  "email:mauricioarraztoa@gmail.com": TORETTO_GYM,
  "id:672d05cd7fa16a4779fe6135": TORETTO_GYM,

  // CRISTIAN QUIROGA
  "email:cristian_quiroga_08@hotmail.com": CRISTIAN_QUIROGA,
  "id:6813162770c9257968a79fe0": CRISTIAN_QUIROGA,

  // RAMA BELTRAME
  "email:beltrameramiro@gmail.com": RAMABELTRAME,
  "id:685372d397535c64dfc56d71": RAMABELTRAME,

  // FRANCO
  "email:francogonzalez.trainer@gmail.com": FRANCO,
  "id:686162e2dbfbe24db072ca57": FRANCO,

  // SOL
  "email:svstrong.training@gmail.com": SOL,
  "id:6861636cdbfbe24db072ca58": SOL,

  // MARTÍN CASANOVA
  "email:martincasanova2001-trainer@gmail.com": MARTIN_CASANOVA,
  "id:686976ccd5788ade7ad998bf": MARTIN_CASANOVA,

  // MACARENA
  "email:macarena.entrenadora@gmail.com": MACARENA,
  "id:6862c3af1d409eaa2904b82a": MACARENA,

  // LEO BURGIO
  "email:leoburgio98@gmail.com": LEO_BURGIO,
  "id:68817363470317ec333efe3d": LEO_BURGIO,

  // VALU MARCHE
  "email:marchesoti465@est.derecho.uba.ar": VALU_MARCHE,
  "id:666dd193caf84a7b159941d2": VALU_MARCHE,

  // AGUSTÍN ARENAS
  "email:agu.arenaspf@gmail.com": AGUSTIN_ARENAS,
  "id:6887d82d7e742d5bca1eada6": AGUSTIN_ARENAS,

  // LEONEL ORTIZ
  "email:leonel.strength-trainer@gmail.com": LEONEL_ORTIZ,
  "id:689cd44499809e2519de8333": LEONEL_ORTIZ,

  // GABRIEL BELLEZA
    "email:gbelleza2@gmail.com": GABRIEL_BELLEZA,
    "id:6898d5261dbf3b2af33fa555": GABRIEL_BELLEZA,

    // NICOLAS ECHAZZARRETA
    "email:echazzarreta-trainer@gmail.com": NICOLAS_ECHAZZA,
    "id:68b08162ad67fcd9c69c31a2": NICOLAS_ECHAZZA,

    // CAMILA BENEITEZ
    "email:camibeneitez.fitness@gmail.com": CAMILA_BENEITEZ,
    "id:68b720931a6600c8359c6cf3": CAMILA_BENEITEZ,
};

/** Logos que llevan fondo blanco/rounded en su variante “chica” */
const LOGOS_BG_WHITE = new Set([
  TOM,
  MARTIN_CASANOVA,
  MACARENA,
  AGUSTIN_ARENAS,
  LEONEL_ORTIZ,
]);

function resolveLogoFromStorage() {
  if (typeof window === "undefined") return DEFAULT_LOGO; // SSR-safe

  const email = (localStorage.getItem("email") || "").trim().toLowerCase();
  const entrenadorId = (localStorage.getItem("entrenador_id") || "").trim();

  const byId = entrenadorId ? LOGO_MAP[`id:${entrenadorId}`] : undefined;
  const byEmail = email ? LOGO_MAP[`email:${email}`] : undefined;

  return byId || byEmail || DEFAULT_LOGO;
}

function LogoChico({ isHomePage }) {
  const [urlPath, setUrlPath] = useState(DEFAULT_LOGO);

  useEffect(() => {
    setUrlPath(resolveLogoFromStorage());
  }, []);

  const usesBgWhite = LOGOS_BG_WHITE.has(urlPath);
  const smallClasses = `img-fluid LargoLogoChico text-center ${
    urlPath === TOM ? "mt-5 py-3" : "my-5 pt-3 pb-3"
  } ${usesBgWhite ? "bg-white rounded-3" : ""}`;

  return (
    <>
      <div className="row justify-content-center LargoLogo align-items-center">
        <h1 className="visually-hidden">TOM</h1>
        <img className={smallClasses} src={urlPath} alt="TOM" />
      </div>
    </>
  );
}

export default LogoChico;
