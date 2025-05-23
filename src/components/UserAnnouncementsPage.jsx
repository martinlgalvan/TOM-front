import React, { useEffect, useState } from "react";
import * as UsersService from "../services/users.services.js";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import Logo from "./Logo.jsx";

function UserAnnouncementsPage() {
    const [history, setHistory] = useState({ past: [], upcoming: [] });
    const [selected, setSelected] = useState(null);
    const [dialogVisible, setDialogVisible] = useState(false);
    const userId = localStorage.getItem("_id");

    useEffect(() => {
        UsersService.getAnnouncementsHistory(userId)
            .then(data => {
                const sortByDateDesc = (a, b) => {
                    const dateA = new Date(a.show_at_date || 0);
                    const dateB = new Date(b.show_at_date || 0);
                    return dateB - dateA;
                };

                setHistory({
                    upcoming: data.upcoming.sort(sortByDateDesc),
                    past: data.past.sort(sortByDateDesc)
                });
            })
            .catch(err => console.error("Error cargando historial de anuncios:", err));
    }, []);

    const openDialog = (announcement) => {
        setSelected(announcement);
        setDialogVisible(true);
    };

    const formatDate = (input) => {
        if (!input) return '';
        const date = new Date(input);
        return date.toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container-fluid totalHeight mt-4">
            <Logo />

            <h2>Anuncios Programados</h2>
            {history.upcoming.length === 0 ? (
                <p>No hay anuncios programados.</p>
            ) : (
                <ul className="list-group mb-4">
                    {history.upcoming.map((a) => (
                        <li key={a._id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{a.title}</strong>
                                <p className="mb-0 text-muted small">
                                    {a.repeat_day
                                        ? `Todos los ${a.repeat_day}`
                                        : a.day_of_month
                                            ? `Todos los ${a.day_of_month} de cada mes`
                                            : `${formatDate(a.show_at_date)}`}
                                </p>
                            </div>
                            <Button label="Ver" onClick={() => openDialog(a)} className="p-button-sm" />
                        </li>
                    ))}
                </ul>
            )}

            <h2>Anuncios Anteriores</h2>
            {history.past.length === 0 ? (
                <p>No hay anuncios anteriores.</p>
            ) : (
                <ul className="list-group">
                    {history.past.map((a) => (
                        <li key={a._id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                            <div>
                                <strong>{a.title}</strong>
                                <p className="mb-0 text-muted small">
                                    {a.repeat_day
                                        ? `Todos los ${a.repeat_day}`
                                        : a.day_of_month
                                            ? `Todos los ${a.day_of_month} de cada mes`
                                            : `${formatDate(a.show_at_date)}`}
                                </p>
                            </div>
                            <Button label="Ver" onClick={() => openDialog(a)} className="p-button-outlined p-button-sm" />
                        </li>
                    ))}
                </ul>
            )}

            {selected && (
                <Dialog header={selected.title} visible={dialogVisible} onHide={() => setDialogVisible(false)}>
                    <p style={{ whiteSpace: "pre-line" }}>{selected.message}</p>

                    {selected.link_urls?.length > 0 && (
                        <div className="mt-3 d-flex flex-column gap-2">
                            {selected.link_urls.map((link, idx, arr) => (
                                <a
                                    key={idx}
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary"
                                >
                                    {arr.length === 1 ? "Ver link" : `Ver link ${idx + 1}`}
                                </a>
                            ))}
                        </div>
                    )}
                </Dialog>
            )}
        </div>
    );
}

export default UserAnnouncementsPage;
