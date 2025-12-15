class Review < ApplicationRecord
  belongs_to :order, optional: true

  before_create :generate_token

  validates :name, presence: { message: "Le nom est obligatoire" }
  validates :content, presence: { message: "Le contenu est obligatoire" }, if: :validated
  validates :stars, presence: { message: "La note est obligatoire" }, if: :validated
  validates :stars, inclusion: {
              in: (1..5).step(0.5).to_a,
              message: "La note doit être comprise entre 1 et 5 (avec des paliers de 0.5 possible)"
            }, allow_nil: true

  validates :content, length: { maximum: 500, message: "Le commentaire ne peut pas dépasser 500 caractères" }

  # Ensure only one review per order
  validates :order_id, uniqueness: { message: "Un avis a déjà été soumis pour cette commande" }, if: -> { order_id.present? }

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64(32) if self.token.blank?
  end
end
