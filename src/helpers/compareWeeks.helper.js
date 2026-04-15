export function getComparisonData(routines) {
    if (!Array.isArray(routines) || routines.length < 2) return [];

    const lastWeek = routines[routines.length - 1];

    if (!lastWeek || !Array.isArray(lastWeek.dias)) return [];

    const comparableWeeks = [];

    routines.slice(0, -1).forEach((week, index) => {
        if (!week || !Array.isArray(week.dias)) return;

        let matchCount = 0;

        week.dias.forEach((day, dayIndex) => {
            if (!lastWeek.dias[dayIndex] || !day || !Array.isArray(day.exercises)) return;

            const lastWeekExercises = lastWeek.dias[dayIndex].exercises || [];

            day.exercises.forEach((exercise) => {
                const match = lastWeekExercises.find(e => e.nombre === exercise.nombre);
                if (match) matchCount++;
            });
        });

        if (matchCount >= 2) {
            comparableWeeks.push({ week, index });
        }
    });

    const allWeeks = [...comparableWeeks.map(w => w.week), lastWeek];
    const labels = [...comparableWeeks.map(w => `Semana ${w.index + 1}`), `Semana ${routines.length}`];

    const ejerciciosComparables = {};

    lastWeek.dias.forEach((day, dayIndex) => {
        if (!Array.isArray(day.exercises)) return;

        day.exercises.forEach((ex) => {
            const nombre = ex.nombre;
            if (!nombre) return;

            allWeeks.forEach((week, wIdx) => {
                const dayW = week?.dias?.[dayIndex];
                const exW = dayW?.exercises?.find(e => e.nombre === nombre);
                if (!exW) return;

                if (!ejerciciosComparables[nombre]) {
                    ejerciciosComparables[nombre] = { peso: [], reps: [], sets: [] };
                }

                ejerciciosComparables[nombre].peso.push({ semana: labels[wIdx], valor: Number(exW.peso || 0) });
                ejerciciosComparables[nombre].reps.push({ semana: labels[wIdx], valor: Number(exW.reps || 0) });
                ejerciciosComparables[nombre].sets.push({ semana: labels[wIdx], valor: Number(exW.sets || 0) });
            });
        });
    });

    return ejerciciosComparables;
}
