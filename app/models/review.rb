class Review < ApplicationRecord
  validates :name, presence: { message: "Le nom est obligatoire" }
  validates :content, presence: { message: "Le contenu est obligatoire" }
  validates :stars, presence: { message: "La note est obligatoire" },
            inclusion: {
              in: (1..5).step(0.5).to_a,
              message: "La note doit être comprise entre 1 et 5 (avec des paliers de 0.5 possible)"
            }
end
