import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Exercises from './../../assets/json/NEW_EXERCISES.json';
import Logo from "../../components/Logo";
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactPlayer from "react-player";

function BibliotecExercises() {
    const { id } = useParams();
    const [exercises, setExercises] = useState([]);
    const [openExercise, setOpenExercise] = useState(null);

    useEffect(() => {
        setExercises(Exercises);
    }, []);

    // Función para convertir enlaces de YouTube Shorts a formato compatible
    const formatVideoUrl = (url) => {
        if (url.includes("shorts/")) {
            return url.replace("shorts/", "watch?v=");
        }
        return url;
    };

    // Alternar acordeón de ejercicios
    const toggleExercise = (exerciseLabel) => {
        setOpenExercise(openExercise === exerciseLabel ? null : exerciseLabel);
    };

    return (
        <>
            <div className="container-fluid p-0">
                <Logo />
            </div>

            <section className="container">
                <h2 className="text-center my-4">Biblioteca de Ejercicios</h2>

                <p className="text-center mt-2 mb-3">En caso de que quieras añadir ejercicios propios, junto a sus videos, comunicate con el administrador para hacerlo.</p>

                {exercises.map((category) => (
                    <Accordion key={category.label} sx={{ backgroundColor: "#ffffff", marginBottom: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h5">Ejercicios de  {category.label}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {category.items.map((exercise) => (
                                <Accordion 
                                    key={exercise.label} 
                                    sx={{ backgroundColor: "#fff" }} 
                                    expanded={openExercise === exercise.label}
                                    onChange={() => toggleExercise(exercise.label)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography>{exercise.label}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {openExercise === exercise.label && (
                                            <ReactPlayer 
                                                url={formatVideoUrl(exercise.video)}
                                                width="100%"
                                                height="315px"
                                                controls={true}
                                            />
                                        )}
                                    </AccordionDetails>
                                </Accordion>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))}
            </section>
        </>
    );
}

export default BibliotecExercises;
