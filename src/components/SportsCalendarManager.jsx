import React from "react";
import { Dialog } from "primereact/dialog";
import { MultiSelect } from "primereact/multiselect";
import { Eye, Trash2 } from "lucide-react";

import * as UsersService from "../services/users.services.js";
import * as Notify from "../helpers/notify.js";

import OpenersPlanEditor from "./OpenersPlanEditor.jsx";
import {
  clonePlanForAssignment,
  createEmptyOpenersPlan,
  normalizeOpenersPlan,
  normalizeOpenersPlans,
  normalizeOpenersTemplate,
  normalizeOpenersTemplates,
  resolveTargetUserIds,
} from "../helpers/openersPlanner.js";

const CATEGORY_OPTIONS = [
  "Alumno casual",
  "Alumno dedicado",
  "Atleta iniciante",
  "Atleta avanzado",
];

const toUserId = (user) => String(user?._id || "");

function SportsCalendarManager({ visible, onHide, coachId, users = [] }) {
  const [loading, setLoading] = React.useState(false);
  const [savingTemplates, setSavingTemplates] = React.useState(false);
  const [assigning, setAssigning] = React.useState(false);

  const [templates, setTemplates] = React.useState([]);

  const [draftPlan, setDraftPlan] = React.useState(() => createEmptyOpenersPlan());
  const [draftDescription, setDraftDescription] = React.useState("");
  const [targetCategories, setTargetCategories] = React.useState([]);
  const [targetUsers, setTargetUsers] = React.useState([]);
  const targetCategoriesRef = React.useRef([]);
  const targetUsersRef = React.useRef([]);
  const [templateEditorDialog, setTemplateEditorDialog] = React.useState({
    visible: false,
    template: null,
  });

  const [assignDialog, setAssignDialog] = React.useState({
    visible: false,
    plan: null,
    template: null,
    targetIds: [],
    targetUsers: [],
  });
  const [deleteTemplateDialog, setDeleteTemplateDialog] = React.useState({
    visible: false,
    templateId: "",
  });
  const [resetDraftDialog, setResetDraftDialog] = React.useState(false);

  const usersOptions = React.useMemo(
    () =>
      (users || []).map((u) => ({
        label: u?.name || u?.email || "Usuario",
        value: toUserId(u),
      })),
    [users]
  );

  const syncTargetCategories = React.useCallback((nextCategories = []) => {
    const normalized = Array.isArray(nextCategories) ? nextCategories : [];
    targetCategoriesRef.current = normalized;
    setTargetCategories(normalized);
  }, []);

  const syncTargetUsers = React.useCallback((nextUsers = []) => {
    const normalized = Array.isArray(nextUsers) ? nextUsers : [];
    targetUsersRef.current = normalized;
    setTargetUsers(normalized);
  }, []);

  const resolveAssignTargets = React.useCallback(() => {
    const ids = resolveTargetUserIds(
      users,
      targetCategoriesRef.current,
      targetUsersRef.current
    );
    const byId = new Set(ids.map(String));
    return {
      ids,
      targetUsers: (users || []).filter((u) => byId.has(toUserId(u))),
    };
  }, [users]);

  const templateSaveLabel = React.useMemo(() => {
    const trimmed = String(draftPlan?.meetName || "").trim();
    return trimmed ? `Guardar plantilla: ${trimmed}` : "Guardar plantilla";
  }, [draftPlan?.meetName]);

  const loadCoachTemplates = React.useCallback(async () => {
    if (!coachId) return;
    setLoading(true);
    try {
      const { openersTemplates } = await UsersService.getOpenersProfileData(coachId);
      const normalized = normalizeOpenersTemplates(openersTemplates);
      setTemplates(normalized);
    } catch (error) {
      Notify.instantToast("No se pudo cargar el calendario deportivo.");
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  React.useEffect(() => {
    if (!visible) return;
    loadCoachTemplates();
  }, [visible, loadCoachTemplates]);

  const persistTemplates = async (nextTemplates) => {
    setSavingTemplates(true);
    try {
      await UsersService.saveOpenersTemplates(coachId, nextTemplates);
      setTemplates(normalizeOpenersTemplates(nextTemplates));
      return true;
    } catch (error) {
      Notify.instantToast("No se pudieron guardar las plantillas.");
      return false;
    } finally {
      setSavingTemplates(false);
    }
  };

  const saveDraftAsTemplate = async () => {
    const nextTemplate = normalizeOpenersTemplate({
      name: String(draftPlan?.meetName || "").trim() || "Plantilla sin nombre",
      description: draftDescription,
      basePlan: normalizeOpenersPlan(draftPlan),
      updated_at: new Date().toISOString(),
    });

    const nextTemplates = [nextTemplate, ...templates];

    const ok = await persistTemplates(nextTemplates);
    if (!ok) return;

    Notify.instantToast("Plantilla guardada.");
  };

  const openTemplateEditor = (template) => {
    syncTargetCategories([]);
    syncTargetUsers([]);
    setTemplateEditorDialog({
      visible: true,
      template: normalizeOpenersTemplate(template),
    });
  };

  const updateTemplateEditor = (nextPatch) => {
    setTemplateEditorDialog((prev) => {
      if (!prev.template) return prev;
      return {
        ...prev,
        template: normalizeOpenersTemplate({
          ...prev.template,
          ...nextPatch,
          updated_at: new Date().toISOString(),
        }),
      };
    });
  };

  const saveTemplateEditor = async () => {
    if (!templateEditorDialog.template?.id) return;
    const nextTemplates = templates.map((tpl) =>
      tpl.id === templateEditorDialog.template.id ? templateEditorDialog.template : tpl
    );
    const ok = await persistTemplates(nextTemplates);
    if (!ok) return;
    Notify.instantToast("Plantilla actualizada.");
  };

  const removeTemplate = async () => {
    const templateId = deleteTemplateDialog.templateId;
    const next = templates.filter((tpl) => tpl.id !== templateId);
    const ok = await persistTemplates(next);
    if (ok) {
      if (templateEditorDialog.template?.id === templateId) {
        setTemplateEditorDialog({ visible: false, template: null });
      }
      Notify.instantToast("Plantilla eliminada.");
    }
    setDeleteTemplateDialog({ visible: false, templateId: "" });
  };

  const resetDraftValues = () => {
    setDraftPlan(createEmptyOpenersPlan());
    setDraftDescription("");
    setResetDraftDialog(false);
  };

  const openAssignDialog = ({ plan, template = null }) => {
    const { ids, targetUsers: nextTargetUsers } = resolveAssignTargets();
    if (!ids.length) {
      Notify.instantToast("Selecciona al menos una categoria o un alumno.");
      return;
    }
    setAssignDialog({
      visible: true,
      plan: normalizeOpenersPlan(plan),
      template,
      targetIds: ids,
      targetUsers: nextTargetUsers,
    });
  };

  const assignPlanToTargets = async () => {
    if (!assignDialog.plan || !assignDialog.targetIds.length) {
      setAssignDialog({ visible: false, plan: null, template: null, targetIds: [], targetUsers: [] });
      return;
    }

    setAssigning(true);
    try {
      let successCount = 0;
      for (const userId of assignDialog.targetIds) {
        const { openersPlans } = await UsersService.getOpenersProfileData(userId);
        const nextPlans = normalizeOpenersPlans([
          clonePlanForAssignment(assignDialog.plan, assignDialog.template),
          ...openersPlans,
        ]);
        await UsersService.saveOpenersPlans(userId, nextPlans);
        successCount += 1;
      }
      Notify.instantToast(`Plan asignado a ${successCount} alumno(s).`);
    } catch (error) {
      Notify.instantToast("No se pudo asignar el plan a todos los alumnos.");
    } finally {
      setAssigning(false);
      setAssignDialog({ visible: false, plan: null, template: null, targetIds: [], targetUsers: [] });
    }
  };

  const assignName = String(assignDialog.plan?.meetName || "").trim() || "sin nombre";

  return (
    <>
      <Dialog
        header="Calendario deportivo"
        visible={visible}
        onHide={onHide}
        className="col-11 col-xl-10"
      >
        {loading ? (
          <p className="text-muted mb-0">Cargando calendario deportivo...</p>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-xl-8">
              <div className="border rounded-3 p-3 h-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <strong>Estructura para cargar plantilla</strong>
                  <span className="text-muted small">
                    Crea y guarda plantillas base. La asignacion se realiza desde plantillas guardadas.
                  </span>
                </div>

                <OpenersPlanEditor
                  value={draftPlan}
                  onChange={setDraftPlan}
                  title="Plan de competencia"
                />

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setResetDraftDialog(true)}
                  >
                    Resetear valores
                  </button>
                </div>
              </div>
            </div>

            <div className="col-12 col-xl-4">
              <div className="border rounded-3 p-3 mb-3">
                <strong className="d-block mb-2">Descripcion y plantilla</strong>
                <label className="form-label mb-1">Descripcion de plantilla (opcional)</label>
                <input
                  className="form-control"
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  placeholder="Ej: Nacional junio, estrategia conservadora."
                />
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm mt-3 w-100"
                  onClick={saveDraftAsTemplate}
                  disabled={savingTemplates}
                >
                  {templateSaveLabel}
                </button>
              </div>

              <div className="border rounded-3 p-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <strong>Plantillas guardadas</strong>
                  <span className="text-muted small">{templates.length} plantilla(s)</span>
                </div>

                {templates.length === 0 ? (
                  <p className="text-muted mb-0">Aun no hay plantillas guardadas.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-2 p-2 d-flex justify-content-between align-items-center gap-2"
                      >
                        <div className="min-w-0">
                          <div className="fw-semibold text-truncate">
                            {template.name || "Plantilla sin nombre"}
                          </div>
                          <small className="text-muted">
                            {template?.updated_at
                              ? `Actualizada: ${new Date(template.updated_at).toLocaleDateString()}`
                              : "Sin fecha"}
                          </small>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openTemplateEditor(template)}
                            title="Ver plantilla"
                          >
                            <Eye size={14} className="me-1" />
                            Ver
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              setDeleteTemplateDialog({
                                visible: true,
                                templateId: template.id,
                              })
                            }
                            title="Eliminar plantilla"
                          >
                            <Trash2 size={14} className="me-1" />
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header={`Plantilla: ${templateEditorDialog.template?.name || "Sin nombre"}`}
        visible={templateEditorDialog.visible}
        onHide={() => setTemplateEditorDialog({ visible: false, template: null })}
        className="col-11 col-xl-9"
      >
        {!templateEditorDialog.template ? null : (
          <div className="row g-3">
            <div className="col-12 col-xl-8">
              <OpenersPlanEditor
                value={templateEditorDialog.template.basePlan}
                onChange={(nextPlan) => updateTemplateEditor({ basePlan: nextPlan })}
                title="Editar plantilla"
              />
            </div>
            <div className="col-12 col-xl-4">
              <div className="border rounded-3 p-3 mb-3">
                <label className="form-label mb-1">Descripcion (opcional)</label>
                <input
                  className="form-control"
                  value={templateEditorDialog.template.description || ""}
                  onChange={(e) => updateTemplateEditor({ description: e.target.value })}
                  placeholder="Descripcion para entrenadores"
                />
              </div>
              <div className="border rounded-3 p-3">
                <strong className="d-block mb-2">Asignar a alumnos</strong>
                <label className="form-label mb-1">Categoria</label>
                <MultiSelect
                  value={targetCategories}
                  options={CATEGORY_OPTIONS}
                  onChange={(e) => syncTargetCategories(e.value || [])}
                  placeholder="Seleccionar categoria"
                  className="w-100 mb-2"
                />
                <label className="form-label mb-1">Alumnos especificos</label>
                <MultiSelect
                  value={targetUsers}
                  options={usersOptions}
                  onChange={(e) => syncTargetUsers(e.value || [])}
                  placeholder="Seleccionar alumnos"
                  className="w-100"
                  optionLabel="label"
                  optionValue="value"
                  filter
                />
                <small className="text-muted d-block mt-2">
                  El plan se asigna una sola vez por alumno, aunque repitas categoria + alumno.
                </small>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={saveTemplateEditor}
                  disabled={savingTemplates}
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() =>
                    openAssignDialog({
                      plan: templateEditorDialog.template.basePlan,
                      template: templateEditorDialog.template,
                    })
                  }
                  disabled={assigning}
                >
                  Asignar a alumnos
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        header="Resetear valores"
        visible={resetDraftDialog}
        onHide={() => setResetDraftDialog(false)}
        className="col-11 col-lg-5"
      >
        <p className="mb-3">
          Esta accion limpia los datos del plan base actual. No afecta las plantillas ya guardadas.
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setResetDraftDialog(false)}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={resetDraftValues}>
            Si, resetear
          </button>
        </div>
      </Dialog>

      <Dialog
        header="Confirmar asignacion"
        visible={assignDialog.visible}
        onHide={() =>
          setAssignDialog({ visible: false, plan: null, template: null, targetIds: [], targetUsers: [] })
        }
        className="col-11 col-lg-6"
      >
        <p className="mb-2">
          Vas a asignar el plan <strong>{assignName}</strong> a los siguientes alumnos:
        </p>
        <ul className="mb-3">
          {assignDialog.targetUsers.map((u) => (
            <li key={toUserId(u)}>{u?.name || u?.email || "Alumno"}</li>
          ))}
        </ul>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() =>
              setAssignDialog({ visible: false, plan: null, template: null, targetIds: [], targetUsers: [] })
            }
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={assignPlanToTargets}
            disabled={assigning}
          >
            Confirmar asignacion
          </button>
        </div>
      </Dialog>

      <Dialog
        header="Eliminar plantilla"
        visible={deleteTemplateDialog.visible}
        onHide={() => setDeleteTemplateDialog({ visible: false, templateId: "" })}
        className="col-11 col-lg-5"
      >
        <p className="mb-3">Esta accion elimina la plantilla guardada. No afecta planes ya asignados.</p>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setDeleteTemplateDialog({ visible: false, templateId: "" })}
          >
            Cancelar
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={removeTemplate}>
            Eliminar
          </button>
        </div>
      </Dialog>
    </>
  );
}

export default SportsCalendarManager;
