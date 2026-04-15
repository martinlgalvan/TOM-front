// src/components/ChangeLogSection.jsx
import React from "react";
import { Container, Typography, Card, CardContent } from "@mui/material";

// Este arreglo de ejemplo representa tu lista de versiones, parches o logs.
// Solo necesitas actualizar la informacion de aqui para que aparezca en tu componente.
const updates = [
    {
        version: "2.0.4",
        date: "08/01/2025",
        changes: [
          "Se agrego una nueva funcionalidad TOUR, en BETA, proximamente, lo tendran los alumnos.",
          "Cambios al diseno de la navegacion en celular. Tanto en los entrandores como alumnos.",
          "Backend hecho para la subida de videos de alumnos al DRIVE. Proximamente.",
          "Cambios en el cronometro de los alumnos. Ahora escucharan un ruido cuando finalize. Tambien es mas grande y claro.",
          "Error visual solucionado que no permitia ver el tiempo de descanso.",
        ],
      },
  {
    version: "2.0.2",
    date: "26/11/2024",
    changes: [
      "QR para iniciar sesion. Se anado la funcionalidad de inicio de sesion mediante QR, para que tus alumnos puedan ingresar escaneandolo.",
      "Incremento general de series y repeticiones Se agregaron 2 botones que permiten aumentar una serie y rep en todos los ejercicios del dia.",
    ],
  },
  {
    version: "1.0.1",
    date: "01/11/2024",
    changes: [
      "Descarga disponible. **BETA Se anado la funcionalidad de descarga.",
      "UX y reestructura del inicio. Se opto por un diseno mas amigable, los alumnos no deberan ver una descripcion del software si asi lo desean.",
      "UX y reestructura del inicio de sesion. Se realizo un cambio de diseno. Se anado la opcion de ver la contrasena al iniciar sesion."
    ],
  },
  {
    version: "2.0.0",
    date: "24/10/2024",
    changes: [
      "Cambios visuales en las **listas de usuarios**",
      "Cambio visuales y estructurales en las **semanas**.",
      "UX. Se agrego **tiempo de edicion**. Ahora podras ver la ultima vez que actualizaste la rutina! (No la ultima vez que se guardo, cuidado con esto). Con respecto a esto, se opto mostrar la ultima vez que se realizo un cambio, y no la ultima vez que se guardo, para que los entrenadores sepan si actualizaron esa planificacion, sin importar si se guardo o no. Consideramos esto la mejor opcion desde el punto de vista de la usabilidad.",
      "Creacion, edicion, y eliminacion de los dias ahora se encuentran juntos.",
      "Edicion del nombre de la semana. Ahora se encuentra dentro de la semana.",
      "Gestion de dias. Ahora se encuentra en la misma pantalla. Ya no tendras que salir para ingresar a los dias de la semana, permitiendo mayor versatilidad a la hora de planificar.",
      "Edicion unica. Se optimizo la edicion, permitiendo editar todo lo que el usuario quiera, con una unica confirmacion al final, permitiendo mejorar el rendimiento y usabilidad.",
      "UX. Se agregaron ventanas de confirmacion, haciendo mas dificil equivocarse al apretar un boton.",
      "Circuitos. Mejora en la creacion de circuitos. Ahora se podra realizar todo en la misma pantalla, sin necesidad de abrir ventanas adicionales.",
      "Entrada en calor. Cambio visual y estructural. Se habilito la edicion unica, para seguir con la misma logica.",
    ],
  },
];

const ChangeLogSection = () => {
  return (
    <Container className="mt-5 pt-5" maxWidth="sm" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" gutterBottom>
        Novedades
      </Typography>
      {updates.map((update, index) => (
        <Card key={index} style={{ marginBottom: "1rem" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Version {update.version}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Fecha: {update.date}
            </Typography>
            {update.changes.map((change, i) => (
              <Typography key={i} variant="body2">
                - {change}
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default ChangeLogSection;
