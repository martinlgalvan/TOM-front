// src/components/ChangeLogSection.jsx
import React from "react";
import { Container, Typography, Card, CardContent } from "@mui/material";

// Este arreglo de ejemplo representa tu lista de versiones, parches o logs.
// Solo necesitas actualizar la información de aquí para que aparezca en tu componente.
const updates = [
    {
        version: "2.0.4",
        date: "08/01/2025",
        changes: [
          "Se agregó una nueva funcionalidad TOUR, en BETA, proximamente, lo tendrán los alumnos.",
          "Cambios al diseño de la navegacion en celular. Tanto en los entrandores como alumnos.",
          "Backend hecho para la subida de videos de alumnos al DRIVE. Proximamente.",
          "Cambios en el cronometro de los alumnos. Ahora escucharan un ruido cuando finalize. También es más grande y claro.",
          "Error visual solucionado que no permitía ver el tiempo de descanso.",
        ],
      },
  {
    version: "2.0.2",
    date: "26/11/2024",
    changes: [
      "QR para iniciar sesión. Se añado la funcionalidad de inicio de sesion mediante QR, para que tus alumnos puedan ingresar escaneandolo.",
      "Incremento general de series y repeticiones Se agregaron 2 botones que permiten aumentar una serie y rep en todos los ejercicios del día.",
    ],
  },
  {
    version: "1.0.1",
    date: "01/11/2024",
    changes: [
      "Descarga disponible. **BETA Se añado la funcionalidad de descarga.",
      "UX y reestructura del inicio. Se optó por un diseño más amigable, los alumnos no deberán ver una descripción del software si asi lo desean.",
      "UX y reestructura del inicio de sesión. Se realizó un cambio de diseño. Se añado la opción de ver la contraseña al iniciar sesión."
    ],
  },
  {
    version: "2.0.0",
    date: "24/10/2024",
    changes: [
      "Cambios visuales en las **listas de usuarios**",
      "Cambio visuales y estructurales en las **semanas**.",
      "UX. Se agregó **tiempo de edición**. Ahora podrás ver la última vez que actualizaste la rutina! (No la última vez que se guardó, cuidado con esto). Con respecto a estó, se optó mostrar la última vez que se realizo un cambio, y no la última vez que se guardó, para que los entrenadores sepan si actualizarón esa planificación, sin importar si se guardó o no. Consideramos esto la mejor opción desde el punto de vista de la usabilidad.",
      "Creación, edición, y eliminación de los días ahora se encuentran juntos.",
      "Edición del nombre de la semana. Ahora se encuentra dentro de la semana.",
      "Gestión de días. Ahora se encuentra en la misma pantalla. Ya no tendrás que salir para ingresar a los días de la semana, permitiendo mayor versatilidad a la hora de planificar.",
      "Edición única. Se optimizó la edición, permitiendo editar todo lo que el usuario quiera, con una única confirmación al final, permitiendo mejorar el rendimiento y usabilidad.",
      "UX. Se agregarón ventanas de confirmación, haciendo más dificil equivocarse al apretar un botón.",
      "Circuitos. Mejorá en la creación de circuitos. Ahora se podrá realizar todo en la misma pantalla, sin necesidad de abrir ventanas adicionales.",
      "Entrada en calor. Cambio visual y estructural. Se habilitó la edición unica, para seguir con la misma logica.",
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
              Versión {update.version}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              Fecha: {update.date}
            </Typography>
            {update.changes.map((change, i) => (
              <Typography key={i} variant="body2">
                • {change}
              </Typography>
            ))}
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default ChangeLogSection;
