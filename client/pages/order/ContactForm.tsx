import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ActionOrderState, OrderState } from "@/pages/order/reducer";
import { cn } from "@/lib/utils";
import PhoneInput from "@/components/PhoneNumber";

interface ContactFormProps {
  state: OrderState;
  dispatcher: (action: ActionOrderState) => void;
}

export default function ContactForm({ state, dispatcher }: ContactFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <Input
          type="email"
          id="email"
          value={state.customer.email}
          onChange={(e) =>
            dispatcher({
              type: "update_customer",
              data: { email: e.target.value },
            })
          }
          placeholder="ton.email@example.com"
          className={cn(
            state.errors.customer?.email ? "border-red-500 border-2" : "",
          )}
          required
        />
        {state.errors.customer?.email && (
          <p className="text-red-500 text-sm mt-1">
            {state.errors.customer.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Nom complet
        </label>
        <Input
          type="text"
          id="name"
          value={state.customer.full_name}
          onChange={(e) =>
            dispatcher({
              type: "update_customer",
              data: { full_name: e.target.value },
            })
          }
          placeholder="John Doe"
          className={cn(
            state.errors.customer?.full_name ? "border-red-500 border-2" : "",
          )}
          required
        />
        {state.errors.customer?.full_name && (
          <p className="text-red-500 text-sm mt-1">
            {state.errors.customer.full_name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Numéro de téléphone
        </label>
        <PhoneInput
          errors={state.errors.customer?.phone}
          value={state.customer.phone}
          onChange={(e) =>
            dispatcher({
              type: "update_customer",
              data: { phone: e.target.value },
            })
          }
          placeholder="06 89 55 09 45"
          id="phone"
        />
      </div>

      <div>
        <label
          htmlFor="referral_source"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Comment connaissez-vous Assmac ? (optionnel)
        </label>
        <select
          id="referral_source"
          value={
            state.customer.referral_source?.startsWith("Autre: ")
              ? "Autre"
              : state.customer.referral_source || ""
          }
          onChange={(e) => {
            const value = e.target.value;
            dispatcher({
              type: "update_customer",
              data: { referral_source: value },
            });
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-500 bg-white transition-[color,box-shadow] appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20fill=%27none%27%20viewBox=%270%200%2020%2020%27%3E%3Cpath%20stroke=%27%236b7280%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m6%208%204%204%204-4%27/%3E%3C/svg%3E')] bg-[length:1.5rem] bg-[right_0.75rem_center] bg-no-repeat pr-12"
        >
          <option value="">Sélectionnez une option</option>
          <option value="Réseaux sociaux (Instagram, Facebook, etc.)">
            Réseaux sociaux (Instagram, Facebook, etc.)
          </option>
          <option value="Recherche Google">Recherche Google</option>
          <option value="Bouche à oreille">Bouche à oreille</option>
          <option value="Événement / Salon">Événement / Salon</option>
          <option value="Autre">Autre</option>
        </select>

        {(state.customer.referral_source === "Autre" ||
          state.customer.referral_source?.startsWith("Autre: ")) && (
          <div className="mt-2">
            <Input
              type="text"
              placeholder="Précisez..."
              value={
                state.customer.referral_source?.startsWith("Autre: ")
                  ? state.customer.referral_source.substring(7)
                  : ""
              }
              onChange={(e) =>
                dispatcher({
                  type: "update_customer",
                  data: {
                    referral_source: e.target.value
                      ? `Autre: ${e.target.value}`
                      : "Autre",
                  },
                })
              }
              className="bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}
