"use client";

import { useState } from "react";
import { Modal } from "@/components/modal";
import { PersonaCreateForm } from "@/components/persona-create-form";
import { WIL_PERSONA_LIMIT } from "@/lib/persona-options";
import type { PersonaSummary } from "@/lib/types";

type PersonaWorkspaceProps = {
  personas: PersonaSummary[];
};

export const PersonaWorkspace = ({ personas }: PersonaWorkspaceProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canCreate = personas.length < WIL_PERSONA_LIMIT;

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            Personas
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
            Personas
          </h1>
          <p className="mt-2 text-sm text-muted">
            {personas.length} of {WIL_PERSONA_LIMIT} persona used.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          disabled={!canCreate}
          className="btn-solid rounded-full px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Add
        </button>
      </div>

      <div className="auth-card overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <caption className="sr-only">Your personas</caption>
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                Name
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Voice
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Audience
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Gender
              </th>
            </tr>
          </thead>
          <tbody>
            {personas.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-muted">
                  No personas yet. Click Add to create one.
                </td>
              </tr>
            ) : (
              personas.map((persona) => (
                <tr key={persona.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-5 py-4 font-semibold text-ink">
                    {persona.name}
                  </th>
                  <td className="max-w-xs truncate px-5 py-4 text-muted">
                    {persona.voice || "—"}
                  </td>
                  <td className="px-5 py-4 text-muted">{persona.audience || "—"}</td>
                  <td className="px-5 py-4 text-muted">{persona.gender || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!canCreate ? (
        <p className="text-sm text-muted">
          Persona limit reached. Wil accounts can keep 1 persona.
        </p>
      ) : null}

      <Modal title="Add persona" isOpen={isModalOpen} onClose={handleCloseModal}>
        <PersonaCreateForm onSuccess={handleCloseModal} />
      </Modal>
    </div>
  );
};
